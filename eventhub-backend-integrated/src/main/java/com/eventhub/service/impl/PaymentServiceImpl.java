package com.eventhub.service.impl;

import com.eventhub.dto.request.PaymentVerifyRequest;
import com.eventhub.dto.response.PagedResponse;
import com.eventhub.dto.response.PaymentResponse;
import com.eventhub.entity.*;
import com.eventhub.enums.PaymentStatus;
import com.eventhub.enums.RegistrationStatus;
import com.eventhub.exception.*;
import com.eventhub.repository.*;
import com.eventhub.service.PaymentService;
import com.eventhub.service.TicketService;
import com.eventhub.util.PageUtil;
import com.eventhub.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.json.JSONObject;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository       paymentRepository;
    private final RegistrationRepository  registrationRepository;
    private final TicketService           ticketService;
    private final SecurityUtil            securityUtil;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    // ── Issue #1 Fix: Real Razorpay order creation ────────────────────────────
    @Override
    public Map<String, Object> createOrder(Long registrationId) {
        Registration reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration", registrationId));

        BigDecimal amount    = reg.getAmountPaid();
        long       amountPaise = amount.multiply(BigDecimal.valueOf(100)).longValue();

        String razorpayOrderId;

        // Free event — no real Razorpay order needed
        if (amount.compareTo(BigDecimal.ZERO) == 0) {
            razorpayOrderId = "order_FREE_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
        } else {
            // ── Real Razorpay SDK call ─────────────────────────────────────────
            try {
                com.razorpay.RazorpayClient client =
                        new com.razorpay.RazorpayClient(razorpayKeyId, razorpayKeySecret);

                JSONObject options = new JSONObject();
                options.put("amount",   amountPaise);
                options.put("currency", "INR");
                options.put("receipt",  "reg_" + registrationId);
                options.put("notes", new JSONObject()
                        .put("registrationId", registrationId)
                        .put("eventTitle",     reg.getEvent().getTitle())
                        .put("userId",         reg.getUser().getId()));

                com.razorpay.Order order = client.orders.create(options);
                razorpayOrderId = order.get("id");
                log.info("Razorpay order created: {} for registration {}", razorpayOrderId, registrationId);

            } catch (Exception e) {
                log.error("Razorpay order creation failed: {}", e.getMessage());
                throw new BusinessException("Payment gateway error: " + e.getMessage());
            }
        }

        // Delete any previous PENDING payment for this registration
        paymentRepository.findByRegistrationId(registrationId).ifPresent(existing -> {
            if (existing.getStatus() == PaymentStatus.PENDING) {
                paymentRepository.delete(existing);
            }
        });

        // Store PENDING payment with real orderId
        Payment payment = Payment.builder()
                .user(reg.getUser())
                .registration(reg)
                .amount(amount)
                .currency("INR")
                .status(PaymentStatus.PENDING)
                .gateway("RAZORPAY")
                .razorpayOrderId(razorpayOrderId)
                .build();
        paymentRepository.save(payment);

        // Build response for frontend Razorpay checkout
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("orderId",    razorpayOrderId);
        response.put("amount",     amountPaise);
        response.put("currency",   "INR");
        response.put("keyId",      razorpayKeyId);
        response.put("name",       reg.getUser().getName());
        response.put("email",      reg.getUser().getEmail());
        response.put("phone",      reg.getUser().getPhone() != null ? reg.getUser().getPhone() : "");
        response.put("eventTitle", reg.getEvent().getTitle());
        response.put("isFree",     amount.compareTo(BigDecimal.ZERO) == 0);
        return response;
    }

    // ── Issue #3 Fix: verifyPayment triggers ticket creation ──────────────────
    @Override
    public PaymentResponse verifyPayment(PaymentVerifyRequest request) {
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found for order: " + request.getRazorpayOrderId()));

        // Already verified — idempotent
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            log.info("Payment already verified: {}", request.getRazorpayOrderId());
            return toResponse(payment);
        }

        // Handle free events — no signature to verify
        boolean isFree = payment.getAmount().compareTo(BigDecimal.ZERO) == 0;

        boolean signatureValid = isFree || verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (!signatureValid) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            log.warn("Payment signature invalid for order: {}", request.getRazorpayOrderId());
            throw new BusinessException("Payment verification failed — invalid signature. No amount was deducted.");
        }

        // Mark payment SUCCESS
        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);

        // Confirm registration
        Registration reg = payment.getRegistration();
        reg.setStatus(RegistrationStatus.ACTIVE);
        registrationRepository.save(reg);

        // ── Issue #3 Fix: Create ticket AFTER payment is verified ─────────────
        try {
            ticketService.createTicket(reg.getId());
            log.info("Ticket created for registration {} after payment {}", reg.getId(), request.getRazorpayPaymentId());
        } catch (Exception e) {
            // Don't fail the payment if ticket creation has an error (idempotent retry possible)
            log.error("Ticket creation failed after payment {} — registration {}: {}",
                    request.getRazorpayPaymentId(), reg.getId(), e.getMessage());
        }

        log.info("Payment verified: {} for registration {}", request.getRazorpayPaymentId(), reg.getId());
        return toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PaymentResponse> getMyPayments(int page, int size) {
        Long uid = securityUtil.getCurrentUserId();
        Pageable pageable = PageUtil.createPageable(page, size, "createdAt", "desc");
        return PageUtil.toPagedResponse(
                paymentRepository.findByUserId(uid, pageable).map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PaymentResponse> getAllPayments(int page, int size) {
        Pageable pageable = PageUtil.createPageable(page, size, "createdAt", "desc");
        return PageUtil.toPagedResponse(
                paymentRepository.findAll(pageable).map(this::toResponse));
    }

    // ── HMAC-SHA256 signature verification ────────────────────────────────────
    private boolean verifySignature(String orderId, String paymentId, String signature) {
        if (signature == null || signature.isBlank()) return false;
        try {
            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                    razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash     = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expected = HexFormat.of().formatHex(hash);
            boolean match   = expected.equals(signature);
            if (!match) log.warn("Signature mismatch — expected={} got={}", expected, signature);
            return match;
        } catch (Exception e) {
            log.error("Signature verification error: {}", e.getMessage());
            return false;
        }
    }

    private PaymentResponse toResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .userName(p.getUser().getName())
                .registrationId(p.getRegistration().getId())
                .eventTitle(p.getRegistration().getEvent().getTitle())
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .status(p.getStatus())
                .razorpayOrderId(p.getRazorpayOrderId())
                .razorpayPaymentId(p.getRazorpayPaymentId())
                .gateway(p.getGateway())
                .createdAt(p.getCreatedAt())
                .build();
    }
}