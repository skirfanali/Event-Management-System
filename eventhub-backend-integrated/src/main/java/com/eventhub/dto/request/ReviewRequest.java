package com.eventhub.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotNull @Min(1) @Max(5)
    private Integer rating;

    @NotBlank
    @Size(min = 10, max = 1000)
    private String comment;
}
