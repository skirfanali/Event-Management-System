package com.eventhub.controller;

import com.eventhub.dto.response.*;
import com.eventhub.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist", description = "Save and manage favourite events")
@SecurityRequirement(name = "Bearer Auth")
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping("/events/{eventId}")
    @Operation(summary = "Toggle event in wishlist (add/remove)")
    public ResponseEntity<ApiResponse<Void>> toggle(@PathVariable Long eventId) {
        wishlistService.toggleWishlist(eventId);
        return ResponseEntity.ok(ApiResponse.success("Wishlist updated"));
    }

    @GetMapping
    @Operation(summary = "Get current user's wishlist")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getMyWishlist() {
        return ResponseEntity.ok(ApiResponse.success("Wishlist fetched", wishlistService.getMyWishlist()));
    }

    @GetMapping("/events/{eventId}/check")
    @Operation(summary = "Check if event is in wishlist")
    public ResponseEntity<ApiResponse<Boolean>> isWishlisted(@PathVariable Long eventId) {
        return ResponseEntity.ok(ApiResponse.success("Wishlist status", wishlistService.isWishlisted(eventId)));
    }
}
