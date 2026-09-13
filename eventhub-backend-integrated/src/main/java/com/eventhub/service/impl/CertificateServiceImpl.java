package com.eventhub.service.impl;

import com.eventhub.dto.response.CertificateResponse;
import com.eventhub.entity.*;
import com.eventhub.exception.*;
import com.eventhub.repository.*;
import com.eventhub.service.CertificateService;
import com.eventhub.service.NotificationService;
import com.eventhub.enums.NotificationType;
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
public class CertificateServiceImpl implements CertificateService {

    private final CertificateRepository  certificateRepository;
    private final UserRepository         userRepository;
    private final EventRepository        eventRepository;
    private final AttendanceRepository   attendanceRepository;
    private final NotificationService    notificationService;
    private final PdfUtil                pdfUtil;
    private final QRCodeUtil             qrCodeUtil;
    private final SecurityUtil           securityUtil;
    private final EmailUtil              emailUtil;

    @Override
    public CertificateResponse generate(Long eventId, Long userId) {
        // Idempotent — return existing if already generated
        if (certificateRepository.existsByUserIdAndEventId(userId, eventId)) {
            return toResponse(certificateRepository.findByUserIdAndEventId(userId, eventId).get());
        }

        User user   = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Event event = eventRepository.findByIdAndDeletedFalse(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", eventId));

        // Must have attended
        if (!attendanceRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new BusinessException("Certificate can only be issued to attendees");
        }

        Certificate cert = Certificate.builder()
                .user(user)
                .event(event)
                .certificateCode(qrCodeUtil.generateCertificateCode())
                .build();

        cert = certificateRepository.save(cert);

        notificationService.createForUser(userId, NotificationType.SYSTEM,
            "Certificate Ready!", "Your certificate for " + event.getTitle() + " is ready to download.");
        emailUtil.sendCertificateEmail(user.getEmail(), user.getName(), event.getTitle());

        return toResponse(cert);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CertificateResponse> getMycertificates() {
        Long uid = securityUtil.getCurrentUserId();
        return certificateRepository.findByUserId(uid).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] downloadCertificate(String code) {
        Certificate cert = certificateRepository.findByCertificateCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found: " + code));
        try {
            return pdfUtil.generateCertificatePdf(cert);
        } catch (Exception e) {
            log.error("Certificate PDF error: {}", e.getMessage());
            throw new RuntimeException("Certificate generation failed");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CertificateResponse verify(String code) {
        return toResponse(certificateRepository.findByCertificateCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found: " + code)));
    }

    private CertificateResponse toResponse(Certificate c) {
        return CertificateResponse.builder()
                .id(c.getId())
                .certificateCode(c.getCertificateCode())
                .userId(c.getUser().getId())
                .userName(c.getUser().getName())
                .eventId(c.getEvent().getId())
                .eventTitle(c.getEvent().getTitle())
                .fileUrl(c.getFileUrl())
                .issuedAt(c.getCreatedAt())
                .build();
    }
}
