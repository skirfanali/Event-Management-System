package com.eventhub.service.impl;

import com.eventhub.dto.response.TicketResponse;
import com.eventhub.entity.*;
import com.eventhub.enums.PaymentStatus;
import com.eventhub.enums.TicketStatus;
import com.eventhub.exception.*;
import com.eventhub.repository.*;
import com.eventhub.service.TicketService;
import com.eventhub.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TicketServiceImpl implements TicketService {

    private final TicketRepository       ticketRepository;
    private final RegistrationRepository registrationRepository;
    private final PaymentRepository      paymentRepository;
    private final SecurityUtil           securityUtil;
    private final QRCodeUtil             qrCodeUtil;
    private final PdfUtil                pdfUtil;

    @Override
    public TicketResponse createTicket(Long registrationId) {
        Registration reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration", registrationId));

        // Validate payment for paid events before generating ticket
        if (!reg.getEvent().isFree()) {
            Payment payment = paymentRepository.findByRegistrationId(registrationId)
                    .orElseThrow(() -> new BusinessException("Payment record not found for this registration"));
            if (payment.getStatus() != PaymentStatus.SUCCESS) {
                throw new BusinessException("Payment not completed. Ticket cannot be generated.");
            }
        }

        // Return existing ticket if already created (idempotent)
        return ticketRepository.findByRegistrationId(registrationId)
                .map(this::toResponse)
                .orElseGet(() -> {
                    String ticketCode = qrCodeUtil.generateTicketCode();
                    String qrData     = qrCodeUtil.generateUniqueQRData(
                            reg.getUser().getId(), reg.getEvent().getId(), registrationId);

                    Ticket ticket = Ticket.builder()
                            .ticketCode(ticketCode)
                            .registration(reg)
                            .user(reg.getUser())
                            .event(reg.getEvent())
                            .status(TicketStatus.CONFIRMED)
                            .price(reg.getAmountPaid())
                            .qrData(qrData)
                            .build();

                    return toResponse(ticketRepository.save(ticket));
                });
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse getByCode(String ticketCode) {
        return toResponse(ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketCode)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getMyTickets() {
        Long uid = securityUtil.getCurrentUserId();
        return ticketRepository.findByUserId(uid).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] downloadTicketPdf(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketCode));
        try {
            byte[] qrBytes = qrCodeUtil.generateQRCodeBytes(ticket.getQrData(), 200, 200);
            return pdfUtil.generateTicketPdf(ticket, qrBytes);
        } catch (Exception e) {
            log.error("PDF generation failed for ticket {}: {}", ticketCode, e.getMessage());
            throw new RuntimeException("PDF generation failed");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public String getQRCodeBase64(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketCode));
        try {
            return qrCodeUtil.generateQRCodeBase64(ticket.getQrData());
        } catch (Exception e) {
            throw new RuntimeException("QR generation failed");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Ticket getTicketEntityByCode(String ticketCode) {
        return ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketCode));
    }

    private TicketResponse toResponse(Ticket t) {
        return TicketResponse.builder()
                .id(t.getId())
                .ticketCode(t.getTicketCode())
                // ✅ FIX: Include registrationId so frontend can match ticket to registration
                .registrationId(t.getRegistration().getId())
                .eventId(t.getEvent().getId())
                .eventTitle(t.getEvent().getTitle())
                .eventDate(t.getEvent().getEventDate())
                .venue(t.getEvent().getVenue())
                .attendeeName(t.getUser().getName())
                .attendeeEmail(t.getUser().getEmail())
                .status(t.getStatus())
                .price(t.getPrice())
                .qrData(t.getQrData())
                .createdAt(t.getCreatedAt())
                .build();
    }
}