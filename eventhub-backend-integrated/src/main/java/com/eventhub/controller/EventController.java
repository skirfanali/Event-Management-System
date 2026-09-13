package com.eventhub.controller;

import com.eventhub.dto.request.EventRequest;
import com.eventhub.dto.response.*;
import com.eventhub.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Tag(name = "Events", description = "Event management — create, update, search, filter")
public class EventController {

    private final EventService eventService;

    // ── Public endpoints ────────────────────────────────────────────────────────
    @GetMapping
    @Operation(summary = "Get all events (paginated)")
    public ResponseEntity<ApiResponse<PagedResponse<EventResponse>>> getAll(
            @RequestParam(defaultValue = "0")    int    page,
            @RequestParam(defaultValue = "12")   int    size,
            @RequestParam(defaultValue = "eventDate") String sortBy,
            @RequestParam(defaultValue = "asc")  String sortDir) {
        return ResponseEntity.ok(ApiResponse.success("Events fetched",
                eventService.getAll(page, size, sortBy, sortDir)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search and filter events")
    public ResponseEntity<ApiResponse<PagedResponse<EventResponse>>> search(
            @RequestParam(required = false) String  search,
            @RequestParam(required = false) String  category,
            @RequestParam(required = false) Boolean isFree,
            @RequestParam(required = false) String  status,
            @RequestParam(defaultValue = "0")    int    page,
            @RequestParam(defaultValue = "12")   int    size,
            @RequestParam(defaultValue = "eventDate") String sortBy,
            @RequestParam(defaultValue = "asc")  String sortDir) {
        return ResponseEntity.ok(ApiResponse.success("Search results",
                eventService.search(search, category, isFree, status, page, size, sortBy, sortDir)));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured events")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getFeatured() {
        return ResponseEntity.ok(ApiResponse.success("Featured events", eventService.getFeatured()));
    }

    @GetMapping("/trending")
    @Operation(summary = "Get trending events by registrations")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getTrending() {
        return ResponseEntity.ok(ApiResponse.success("Trending events", eventService.getTrending()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get event by ID")
    public ResponseEntity<ApiResponse<EventResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Event fetched", eventService.getById(id)));
    }

    // ── Authenticated endpoints ──────────────────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @SecurityRequirement(name = "Bearer Auth")
    @Operation(summary = "Create a new event (ORGANIZER/ADMIN)")
    public ResponseEntity<ApiResponse<EventResponse>> create(@Valid @RequestBody EventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Event created successfully", eventService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @SecurityRequirement(name = "Bearer Auth")
    @Operation(summary = "Update an event (owner or ADMIN)")
    public ResponseEntity<ApiResponse<EventResponse>> update(
            @PathVariable Long id, @Valid @RequestBody EventRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Event updated", eventService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @SecurityRequirement(name = "Bearer Auth")
    @Operation(summary = "Soft-delete an event (owner or ADMIN)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        eventService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Event deleted successfully"));
    }

    @PostMapping("/{id}/image")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @SecurityRequirement(name = "Bearer Auth")
    @Operation(summary = "Upload event cover image")
    public ResponseEntity<ApiResponse<String>> uploadImage(
            @PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Image uploaded", eventService.uploadEventImage(id, file)));
    }
}
