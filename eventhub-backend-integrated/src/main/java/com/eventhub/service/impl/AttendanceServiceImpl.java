package com.eventhub.service.impl;

import com.eventhub.dto.request.AttendanceScanRequest;
import com.eventhub.dto.response.AttendanceResponse;
import com.eventhub.dto.response.PagedResponse;
import com.eventhub.entity.*;
import com.eventhub.enums.AttendanceStatus;
import com.eventhub.enums.TicketStatus;
import com.eventhub.exception.*;
import com.eventhub.repository.*;
import com.eventhub.service.AttendanceService;
import com.eventhub.util.PageUtil;
import com.eventhub.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final TicketRepository     ticketRepository;
    private final EventRepository      eventRepository;
    private final SecurityUtil         securityUtil;

    @Override
    public AttendanceResponse scanQR(AttendanceScanRequest request) {
        Ticket ticket = ticketRepository.findByQrData(request.getQrData())
                .orElseThrow(() -> new BadRequestException("Invalid QR code — ticket not found"));

        if (ticket.getStatus() == TicketStatus.CANCELLED)
            throw new BusinessException("This ticket has been cancelled");
        if (ticket.getStatus() == TicketStatus.USED)
            throw new BusinessException("Ticket already used for check-in");

        Long userId  = ticket.getUser().getId();
        Long eventId = ticket.getEvent().getId();

        if (attendanceRepository.existsByUserIdAndEventId(userId, eventId))
            throw new BusinessException("Attendee already checked in");

        ticket.setStatus(TicketStatus.USED);
        ticketRepository.save(ticket);

        Attendance att = Attendance.builder()
                .user(ticket.getUser())
                .event(ticket.getEvent())
                .ticket(ticket)
                .status(AttendanceStatus.PRESENT)
                .checkedInAt(LocalDateTime.now())
                .scannedBy(securityUtil.getCurrentUser().getName())
                .build();

        return toResponse(attendanceRepository.save(att));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AttendanceResponse> getEventAttendance(Long eventId, int page, int size) {
        if (!eventRepository.existsById(eventId)) throw new ResourceNotFoundException("Event", eventId);
        Pageable pageable = PageUtil.createPageable(page, size, "checkedInAt", "desc");
        return PageUtil.toPagedResponse(
            attendanceRepository.findByEventId(eventId, pageable).map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getAttendanceStats(Long eventId) {
        Event event = eventRepository.findByIdAndDeletedFalse(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", eventId));

        long total      = attendanceRepository.countByEventId(eventId);
        long present    = attendanceRepository.countPresentByEventId(eventId);
        long registered = event.getRegisteredCount();
        long absent     = Math.max(0, registered - present);
        double pct      = registered == 0 ? 0 : Math.round((present * 100.0 / registered) * 10.0) / 10.0;

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalRegistered", registered);
        stats.put("totalCheckedIn",  present);
        stats.put("absent",          absent);
        stats.put("attendanceRate",  pct);
        stats.put("eventTitle",      event.getTitle());
        return stats;
    }

    // ✅ NEW: Get current logged-in user's attendance history
    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AttendanceResponse> getMyAttendance(int page, int size) {
        Long uid      = securityUtil.getCurrentUserId();
        Pageable pageable = PageUtil.createPageable(page, size, "checkedInAt", "desc");
        return PageUtil.toPagedResponse(
            attendanceRepository.findByUserId(uid, pageable).map(this::toResponse));
    }

    private AttendanceResponse toResponse(Attendance a) {
        return AttendanceResponse.builder()
                .id(a.getId())
                .userId(a.getUser().getId())
                .userName(a.getUser().getName())
                .userEmail(a.getUser().getEmail())
                .eventId(a.getEvent().getId())
                .eventTitle(a.getEvent().getTitle())
                .status(a.getStatus())
                .checkedInAt(a.getCheckedInAt())
                .ticketCode(a.getTicket() != null ? a.getTicket().getTicketCode() : null)
                .build();
    }
}