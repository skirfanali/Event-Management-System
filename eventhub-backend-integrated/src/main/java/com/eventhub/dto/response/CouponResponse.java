package com.eventhub.dto.response;

import com.eventhub.enums.CouponType;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CouponResponse {
    private Long id;
    private String code;
    private CouponType type;
    private BigDecimal value;
    private Integer usageLimit;
    private Integer usedCount;
    private boolean active;
    private String description;
    private LocalDateTime expiresAt;
}
