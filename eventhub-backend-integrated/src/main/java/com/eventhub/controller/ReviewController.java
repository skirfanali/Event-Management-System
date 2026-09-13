package com.eventhub.controller;

import com.eventhub.dto.request.ReviewRequest;
import com.eventhub.dto.response.*;
import com.eventhub.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Event reviews and ratings")
@SecurityRequirement(name = "Bearer Auth")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/events/{eventId}/reviews")
    @Operation(summary = "Add a review for an event")
    public ResponseEntity<ApiResponse<ReviewResponse>> addReview(
            @PathVariable Long eventId,
            @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted!", reviewService.addReview(eventId, request)));
    }

    @GetMapping("/events/{eventId}/reviews")
    @Operation(summary = "Get all reviews for an event")
    public ResponseEntity<ApiResponse<PagedResponse<ReviewResponse>>> getEventReviews(
            @PathVariable Long eventId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Reviews fetched",
                reviewService.getEventReviews(eventId, page, size)));
    }

    @PutMapping("/reviews/{reviewId}")
    @Operation(summary = "Update your review")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Review updated", reviewService.updateReview(reviewId, request)));
    }

    @DeleteMapping("/reviews/{reviewId}")
    @Operation(summary = "Delete your review")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Review deleted"));
    }

    @GetMapping("/reviews/my")
    @Operation(summary = "Get current user's reviews")
    public ResponseEntity<ApiResponse<PagedResponse<ReviewResponse>>> getMyReviews(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("My reviews", reviewService.getMyReviews(page, size)));
    }
}
