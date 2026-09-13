package com.eventhub.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class EventRequest {
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200)
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10)
    private String description;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotNull(message = "Event date is required")
    @Future(message = "Event date must be in the future")
    private LocalDateTime eventDate;

    private LocalDateTime endDate;

    @NotBlank(message = "Venue is required")
    private String venue;

    private String venueAddress;
    private String city;

    @NotNull @Min(1) @Max(100000)
    private Integer capacity;

    private BigDecimal price = BigDecimal.ZERO;

    // ✅ FIX: boolean isFree → Lombok generates getter isFree() → Jackson serializes as "free"
    // and generates setter setFree() → Jackson can't match incoming JSON "isFree" → always stays true
    // @JsonProperty("isFree") forces Jackson to use "isFree" for both serialize AND deserialize
    @JsonProperty("isFree")
    private boolean isFree = true;

    private String tags;
    private String imageUrl;
}