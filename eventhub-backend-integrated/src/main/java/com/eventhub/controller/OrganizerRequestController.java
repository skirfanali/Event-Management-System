package com.eventhub.controller;

import com.eventhub.dto.request.AdminReviewRequest;
import com.eventhub.dto.request.OrganizerRegisterRequest;
import com.eventhub.dto.response.*;
import com.eventhub.service.OrganizerRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/organizer-requests")
@RequiredArgsConstructor
@Tag(name = "Organizer Requests", description = "Organizer account request management")
public class OrganizerRequestController {

    private final OrganizerRequestService organizerRequestService;

    // ── Public: submit application ────────────────────────────────────────────
    @PostMapping
    @Operation(summary = "Submit organizer account request (public)")
    public ResponseEntity<ApiResponse<OrganizerRequestResponse>> submit(
            @Valid @RequestBody OrganizerRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                    "Your organizer request has been submitted! We'll review it shortly.",
                    organizerRequestService.submit(request)));
    }

    // ── Admin: list all requests ──────────────────────────────────────────────
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Auth")
    @Operation(summary = "Get all organizer requests (ADMIN only)")
    public ResponseEntity<ApiResponse<PagedResponse<OrganizerRequestResponse>>> getAll(
            @RequestParam(defaultValue = "0")    int    page,
            @RequestParam(defaultValue = "20")   int    size,
            @RequestParam(defaultValue = "ALL")  String status) {
        return ResponseEntity.ok(ApiResponse.success("Organizer requests",
                organizerRequestService.getAll(page, size, status)));
    }

    // ── Admin: pending count for badge ────────────────────────────────────────
    @GetMapping("/pending-count")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Auth")
    @Operation(summary = "Get count of pending organizer requests (ADMIN only)")
    public ResponseEntity<ApiResponse<Long>> getPendingCount() {
        return ResponseEntity.ok(ApiResponse.success("Pending count",
                organizerRequestService.getPendingCount()));
    }

    // ── Admin: approve ────────────────────────────────────────────────────────
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Auth")
    @Operation(summary = "Approve organizer request — creates account (ADMIN only)")
    public ResponseEntity<ApiResponse<OrganizerRequestResponse>> approve(
            @PathVariable Long id,
            @RequestBody(required = false) AdminReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Request approved. Organizer account created.",
                organizerRequestService.approve(id, request)));
    }

    // ── Admin: reject ─────────────────────────────────────────────────────────
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer Auth")
    @Operation(summary = "Reject organizer request (ADMIN only)")
    public ResponseEntity<ApiResponse<OrganizerRequestResponse>> reject(
            @PathVariable Long id,
            @RequestBody(required = false) AdminReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Request rejected.",
                organizerRequestService.reject(id, request)));
    }
}