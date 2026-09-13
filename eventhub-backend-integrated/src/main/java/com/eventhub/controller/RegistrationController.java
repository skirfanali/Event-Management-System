package com.eventhub.controller;

import com.eventhub.dto.response.*;
import com.eventhub.service.RegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
@Tag(name = "Registrations", description = "Event registration management")
@SecurityRequirement(name = "Bearer Auth")
public class RegistrationController {

    private final RegistrationService registrationService;

    @PostMapping("/events/{eventId}")
    @Operation(summary = "Register for an event")
    public ResponseEntity<ApiResponse<RegistrationResponse>> register(
            @PathVariable Long eventId,
            @RequestParam(required = false) String couponCode) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Successfully registered!", registrationService.register(eventId, couponCode)));
    }

    @DeleteMapping("/events/{eventId}")
    @Operation(summary = "Cancel registration for an event")
    public ResponseEntity<ApiResponse<Void>> cancel(@PathVariable Long eventId) {
        registrationService.cancelRegistration(eventId);
        return ResponseEntity.ok(ApiResponse.success("Registration cancelled"));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's registrations")
    public ResponseEntity<ApiResponse<PagedResponse<RegistrationResponse>>> getMyRegistrations(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("My registrations",
                registrationService.getMyRegistrations(page, size)));
    }

    @GetMapping("/events/{eventId}")
    @Operation(summary = "Get all registrations for an event (ORGANIZER/ADMIN)")
    public ResponseEntity<ApiResponse<PagedResponse<RegistrationResponse>>> getEventRegistrations(
            @PathVariable Long eventId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Event registrations",
                registrationService.getEventRegistrations(eventId, page, size)));
    }

    @GetMapping("/events/{eventId}/check")
    @Operation(summary = "Check if current user is registered for an event")
    public ResponseEntity<ApiResponse<Boolean>> isRegistered(@PathVariable Long eventId) {
        return ResponseEntity.ok(ApiResponse.success("Registration status",
                registrationService.isRegistered(eventId)));
    }
}
