package com.eventhub.controller;

import com.eventhub.dto.request.AttendanceScanRequest;
import com.eventhub.dto.response.*;
import com.eventhub.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "QR-based check-in and attendance tracking")
@SecurityRequirement(name = "Bearer Auth")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/scan")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @Operation(summary = "Scan QR code to mark attendance (ORGANIZER/ADMIN)")
    public ResponseEntity<ApiResponse<AttendanceResponse>> scan(
            @Valid @RequestBody AttendanceScanRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Attendance marked successfully!",
                attendanceService.scanQR(request)));
    }

    @GetMapping("/events/{eventId}")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @Operation(summary = "Get attendance list for an event")
    public ResponseEntity<ApiResponse<PagedResponse<AttendanceResponse>>> getEventAttendance(
            @PathVariable Long eventId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Attendance list",
                attendanceService.getEventAttendance(eventId, page, size)));
    }

    @GetMapping("/events/{eventId}/stats")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @Operation(summary = "Get attendance statistics for an event")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats(@PathVariable Long eventId) {
        return ResponseEntity.ok(ApiResponse.success("Attendance stats",
                attendanceService.getAttendanceStats(eventId)));
    }

    // ✅ NEW: User's own attendance history
    @GetMapping("/my")
    @Operation(summary = "Get current user's attendance history")
    public ResponseEntity<ApiResponse<PagedResponse<AttendanceResponse>>> getMyAttendance(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("My attendance history",
                attendanceService.getMyAttendance(page, size)));
    }
}