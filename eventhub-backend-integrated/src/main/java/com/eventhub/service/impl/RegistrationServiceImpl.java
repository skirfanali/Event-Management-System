package com.eventhub.service.impl;

import com.eventhub.dto.response.PagedResponse;
import com.eventhub.dto.response.RegistrationResponse;
import com.eventhub.entity.*;
import com.eventhub.enums.EventStatus;
import com.eventhub.enums.RegistrationStatus;
import com.eventhub.exception.*;
import com.eventhub.repository.*;
import com.eventhub.service.CouponService;
import com.eventhub.service.NotificationService;
import com.eventhub.service.RegistrationService;
import com.eventhub.service.TicketService;
import com.eventhub.enums.NotificationType;
import com.eventhub.util.EmailUtil;
import com.eventhub.util.PageUtil;
import com.eventhub.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class RegistrationServiceImpl implements RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final EventRepository        eventRepository;
    private final TicketService          ticketService;
    private final CouponService          couponService;
    private final NotificationService    notificationService;
    private final EmailUtil              emailUtil;
    private final SecurityUtil           securityUtil;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("EEE, MMM dd yyyy HH:mm");

    @Override
    public RegistrationResponse register(Long eventId, String couponCode) {
        User user = securityUtil.getCurrentUser();
        Event event = eventRepository.findByIdAndDeletedFalse(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", eventId));

        if (event.getStatus() == EventStatus.CANCELLED || event.getStatus() == EventStatus.COMPLETED) {
            throw new BusinessException("Registration is closed for this event");
        }

        // ✅ FIX: Check BOTH ACTIVE and PENDING — prevents duplicate registrations
        // while payment is in progress
        boolean alreadyRegistered =
            registrationRepository.existsByUserIdAndEventIdAndStatus(user.getId(), eventId, RegistrationStatus.ACTIVE) ||
            registrationRepository.existsByUserIdAndEventIdAndStatus(user.getId(), eventId, RegistrationStatus.PENDING);

        if (alreadyRegistered) {
            throw new BadRequestException("You are already registered for this event");
        }

        if (event.getRegisteredCount() >= event.getCapacity()) {
            throw new BusinessException("Event is fully booked");
        }

        // Coupon & pricing
        BigDecimal price    = event.isFree() ? BigDecimal.ZERO : event.getPrice();
        BigDecimal discount = BigDecimal.ZERO;

        if (couponCode != null && !couponCode.isBlank() && !event.isFree()) {
            discount = couponService.applyDiscount(couponCode, price);
        }

        BigDecimal finalAmount = price.subtract(discount).max(BigDecimal.ZERO);

        // Free events → ACTIVE immediately; Paid events → PENDING until payment verified
        Registration reg = Registration.builder()
                .user(user)
                .event(event)
                .status(event.isFree() ? RegistrationStatus.ACTIVE : RegistrationStatus.PENDING)
                .amountPaid(finalAmount)
                .couponCode(couponCode)
                .discount(discount)
                .build();

        reg = registrationRepository.save(reg);

        event.setRegisteredCount(event.getRegisteredCount() + 1);
        eventRepository.save(event);

        // Only auto-generate ticket for FREE events.
        // Paid events: ticket is created in PaymentServiceImpl after payment verification.
        if (event.isFree()) {
            ticketService.createTicket(reg.getId());

            notificationService.createForUser(user.getId(), NotificationType.TICKET,
                "Registration Confirmed!", "You are registered for " + event.getTitle());

            emailUtil.sendRegistrationConfirmationEmail(
                user.getEmail(), user.getName(), event.getTitle(),
                reg.getTicket() != null ? reg.getTicket().getTicketCode() : "N/A",
                event.getEventDate().format(FMT), event.getVenue());

            log.info("Free event: ticket generated for user {} on event {}", user.getEmail(), event.getTitle());
        } else {
            log.info("Paid event: registration PENDING for user {} on event {}", user.getEmail(), event.getTitle());
        }

        return toResponse(reg);
    }

    @Override
    public void cancelRegistration(Long eventId) {
        User user = securityUtil.getCurrentUser();
        Registration reg = registrationRepository.findByUserIdAndEventId(user.getId(), eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));

        if (reg.getStatus() == RegistrationStatus.CANCELLED) {
            throw new BadRequestException("Registration is already cancelled");
        }

        reg.setStatus(RegistrationStatus.CANCELLED);
        if (reg.getTicket() != null) {
            reg.getTicket().setStatus(com.eventhub.enums.TicketStatus.CANCELLED);
        }
        registrationRepository.save(reg);

        Event event = reg.getEvent();
        event.setRegisteredCount(Math.max(0, event.getRegisteredCount() - 1));
        eventRepository.save(event);

        notificationService.createForUser(user.getId(), NotificationType.EVENT,
            "Registration Cancelled", "Your registration for " + event.getTitle() + " has been cancelled.");
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<RegistrationResponse> getMyRegistrations(int page, int size) {
        Long uid = securityUtil.getCurrentUserId();
        Pageable pageable = PageUtil.createPageable(page, size, "createdAt", "desc");
        return PageUtil.toPagedResponse(
            registrationRepository.findByUserId(uid, pageable).map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<RegistrationResponse> getEventRegistrations(Long eventId, int page, int size) {
        Pageable pageable = PageUtil.createPageable(page, size, "createdAt", "desc");
        return PageUtil.toPagedResponse(
            registrationRepository.findByEventId(eventId, pageable).map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isRegistered(Long eventId) {
        Long uid = securityUtil.getCurrentUserId();
        return registrationRepository.existsByUserIdAndEventIdAndStatus(
            uid, eventId, RegistrationStatus.ACTIVE);
    }

    private RegistrationResponse toResponse(Registration r) {
        return RegistrationResponse.builder()
                .id(r.getId())
                .userId(r.getUser().getId())
                .userName(r.getUser().getName())
                .eventId(r.getEvent().getId())
                .eventTitle(r.getEvent().getTitle())
                .eventDate(r.getEvent().getEventDate())
                .venue(r.getEvent().getVenue())
                .status(r.getStatus())
                .amountPaid(r.getAmountPaid())
                .couponCode(r.getCouponCode())
                .discount(r.getDiscount())
                .createdAt(r.getCreatedAt())
                .build();
    }
}