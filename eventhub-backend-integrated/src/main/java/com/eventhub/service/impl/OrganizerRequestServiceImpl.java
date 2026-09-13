package com.eventhub.service.impl;

import com.eventhub.dto.request.AdminReviewRequest;
import com.eventhub.dto.request.OrganizerRegisterRequest;
import com.eventhub.dto.response.OrganizerRequestResponse;
import com.eventhub.dto.response.PagedResponse;
import com.eventhub.entity.*;
import com.eventhub.enums.OrganizerRequestStatus;
import com.eventhub.enums.Role;
import com.eventhub.exception.*;
import com.eventhub.repository.*;
import com.eventhub.service.NotificationService;
import com.eventhub.service.OrganizerRequestService;
import com.eventhub.util.EmailUtil;
import com.eventhub.util.PageUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class OrganizerRequestServiceImpl implements OrganizerRequestService {

    private final OrganizerRequestRepository requestRepository;
    private final UserRepository             userRepository;
    private final NotificationService        notificationService;
    private final EmailUtil                  emailUtil;
    private final PasswordEncoder            passwordEncoder;

    // ── Step 1: Applicant submits request ────────────────────────────────────
    @Override
    public OrganizerRequestResponse submit(OrganizerRegisterRequest req) {
        // Block if email already a registered user
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new BadRequestException("An account with this email already exists. Please login.");
        }
        // Block duplicate pending requests
        if (requestRepository.existsByEmailAndStatus(req.getEmail(), OrganizerRequestStatus.PENDING)) {
            throw new BadRequestException("You already have a pending organizer request. Please wait for admin review.");
        }

        OrganizerRequest request = OrganizerRequest.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .organization(req.getOrganization())
                .designation(req.getDesignation())
                .reason(req.getReason())
                .status(OrganizerRequestStatus.PENDING)
                .build();

        requestRepository.save(request);

        // Send confirmation email to applicant
        try {
            emailUtil.sendOrganizerRequestConfirmationEmail(
                req.getEmail(), req.getName());
        } catch (Exception e) {
            log.warn("Failed to send confirmation email to {}: {}", req.getEmail(), e.getMessage());
        }

        // Notify all admins via notification
        userRepository.findAllByRole(Role.ADMIN).forEach(admin -> {
            try {
                notificationService.createForUser(admin.getId(),
                    com.eventhub.enums.NotificationType.SYSTEM,
                    "New Organizer Request",
                    req.getName() + " (" + req.getEmail() + ") wants to become an organizer.");
            } catch (Exception e) {
                log.warn("Failed to notify admin {}: {}", admin.getEmail(), e.getMessage());
            }
        });

        log.info("Organizer request submitted by: {} ({})", req.getName(), req.getEmail());
        return toResponse(request);
    }

    // ── Step 2: Admin lists all requests ─────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public PagedResponse<OrganizerRequestResponse> getAll(int page, int size, String status) {
        Pageable pageable = PageUtil.createPageable(page, size, "createdAt", "desc");
        Page<OrganizerRequest> requests;
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            requests = requestRepository.findByStatus(
                OrganizerRequestStatus.valueOf(status.toUpperCase()), pageable);
        } else {
            requests = requestRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return PageUtil.toPagedResponse(requests.map(this::toResponse));
    }

    // ── Step 3a: Admin APPROVES → create real user account ───────────────────
    @Override
    public OrganizerRequestResponse approve(Long id, AdminReviewRequest adminReq) {
        OrganizerRequest request = getOrThrow(id);
        if (request.getStatus() != OrganizerRequestStatus.PENDING) {
            throw new BadRequestException("This request has already been reviewed.");
        }

        // Create the organizer account
        User organizer = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(request.getPassword()) // already hashed at submission
                .role(Role.ORGANIZER)
                .phone(request.getPhone())
                .organization(request.getOrganization())
                .designation(request.getDesignation())
                .emailVerified(true) // auto-verify since admin approved
                .active(true)
                .build();
        userRepository.save(organizer);

        // Update request status
        request.setStatus(OrganizerRequestStatus.APPROVED);
        request.setAdminNote(adminReq != null ? adminReq.getAdminNote() : null);
        request.setReviewedAt(LocalDateTime.now());
        requestRepository.save(request);

        // Send approval email
        try {
            emailUtil.sendOrganizerApprovalEmail(request.getEmail(), request.getName());
        } catch (Exception e) {
            log.warn("Failed to send approval email to {}: {}", request.getEmail(), e.getMessage());
        }

        log.info("Organizer request APPROVED for: {} ({})", request.getName(), request.getEmail());
        return toResponse(request);
    }

    // ── Step 3b: Admin REJECTS ────────────────────────────────────────────────
    @Override
    public OrganizerRequestResponse reject(Long id, AdminReviewRequest adminReq) {
        OrganizerRequest request = getOrThrow(id);
        if (request.getStatus() != OrganizerRequestStatus.PENDING) {
            throw new BadRequestException("This request has already been reviewed.");
        }

        request.setStatus(OrganizerRequestStatus.REJECTED);
        request.setAdminNote(adminReq != null ? adminReq.getAdminNote() : null);
        request.setReviewedAt(LocalDateTime.now());
        requestRepository.save(request);

        // Send rejection email with optional reason
        try {
            emailUtil.sendOrganizerRejectionEmail(
                request.getEmail(), request.getName(),
                adminReq != null ? adminReq.getAdminNote() : null);
        } catch (Exception e) {
            log.warn("Failed to send rejection email to {}: {}", request.getEmail(), e.getMessage());
        }

        log.info("Organizer request REJECTED for: {} ({})", request.getName(), request.getEmail());
        return toResponse(request);
    }

    @Override
    @Transactional(readOnly = true)
    public long getPendingCount() {
        return requestRepository.countByStatus(OrganizerRequestStatus.PENDING);
    }

    private OrganizerRequest getOrThrow(Long id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organizer request", id));
    }

    private OrganizerRequestResponse toResponse(OrganizerRequest r) {
        return OrganizerRequestResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .email(r.getEmail())
                .phone(r.getPhone())
                .organization(r.getOrganization())
                .designation(r.getDesignation())
                .reason(r.getReason())
                .status(r.getStatus())
                .adminNote(r.getAdminNote())
                .createdAt(r.getCreatedAt())
                .reviewedAt(r.getReviewedAt())
                .build();
    }
}