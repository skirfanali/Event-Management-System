package com.eventhub.dto.response;

import com.eventhub.enums.CouponType;
import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CouponValidateResponse {
    private boolean valid;
    private String code;
    private CouponType type;
    private BigDecimal value;
    private BigDecimal discountAmount;
    private String description;
    private String message;
}
