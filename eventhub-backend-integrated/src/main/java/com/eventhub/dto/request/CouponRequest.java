package com.eventhub.dto.request;

import com.eventhub.enums.CouponType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CouponRequest {
    @NotBlank @Pattern(regexp = "^[A-Z0-9]{4,20}$", message = "Code must be 4-20 uppercase alphanumeric chars")
    private String code;

    @NotNull private CouponType type;

    @NotNull @DecimalMin("0.01")
    private BigDecimal value;

    @Min(1) private Integer usageLimit = 100;
    private LocalDateTime expiresAt;
    private String description;
}
