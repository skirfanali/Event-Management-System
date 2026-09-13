package com.eventhub.dto.response;

import com.eventhub.enums.EventStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EventResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private Long categoryId;
    private String organizerName;
    private Long organizerId;
    private LocalDateTime eventDate;
    private LocalDateTime endDate;
    private String venue;
    private String venueAddress;
    private String city;
    private Integer capacity;
    private Integer registeredCount;
    private BigDecimal price;

    // ✅ FIX: boolean isFree → Jackson serializes as "free" without this annotation
    // Frontend reads event.isFree — without @JsonProperty it's always undefined
    @JsonProperty("isFree")
    private boolean isFree;

    private String imageUrl;
    private EventStatus status;
    private String tags;
    private BigDecimal avgRating;
    private Integer reviewCount;
    private LocalDateTime createdAt;

    @JsonProperty("wishlisted")
    private boolean wishlisted;

    @JsonProperty("registeredByCurrentUser")
    private boolean registeredByCurrentUser;

    private Integer spotsLeft;
}