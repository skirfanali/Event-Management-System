package com.eventhub.dto.response;

import com.eventhub.enums.PaymentStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long registrationId;
    private String eventTitle;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String gateway;
    private LocalDateTime createdAt;
}
