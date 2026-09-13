package com.eventhub.controller;

import com.eventhub.dto.response.*;
import com.eventhub.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/organizer")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
@SecurityRequirement(name = "Bearer Auth")
@Tag(name = "Organizer", description = "Organizer dashboard and event management")
public class OrganizerController {

    private final EventService       eventService;
    private final AnalyticsService   analyticsService;
    private final RegistrationService registrationService;
    private final AttendanceService  attendanceService;
    private final CertificateService certificateService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get organizer analytics dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Organizer dashboard", analyticsService.getOrganizerDashboard()));
    }

    @GetMapping("/events")
    @Operation(summary = "Get organizer's own events")
    public ResponseEntity<ApiResponse<PagedResponse<EventResponse>>> getMyEvents(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("My events", eventService.getByOrganizer(page, size)));
    }

    @GetMapping("/events/{eventId}/registrations")
    @Operation(summary = "Get registrations for organizer's event")
    public ResponseEntity<ApiResponse<PagedResponse<RegistrationResponse>>> getEventRegistrations(
            @PathVariable Long eventId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Event registrations",
                registrationService.getEventRegistrations(eventId, page, size)));
    }

    @GetMapping("/events/{eventId}/attendance")
    @Operation(summary = "Get attendance for organizer's event")
    public ResponseEntity<ApiResponse<PagedResponse<AttendanceResponse>>> getAttendance(
            @PathVariable Long eventId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Attendance",
                attendanceService.getEventAttendance(eventId, page, size)));
    }

    @GetMapping("/events/{eventId}/attendance/stats")
    @Operation(summary = "Get attendance stats for organizer's event")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAttendanceStats(@PathVariable Long eventId) {
        return ResponseEntity.ok(ApiResponse.success("Attendance stats",
                attendanceService.getAttendanceStats(eventId)));
    }

    @PostMapping("/events/{eventId}/certificates/{userId}")
    @Operation(summary = "Issue certificate to attendee")
    public ResponseEntity<ApiResponse<CertificateResponse>> issueCertificate(
            @PathVariable Long eventId, @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Certificate issued",
                certificateService.generate(eventId, userId)));
    }
}
