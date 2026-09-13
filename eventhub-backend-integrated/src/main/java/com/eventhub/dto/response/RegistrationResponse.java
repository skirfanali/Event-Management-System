package com.eventhub.dto.response;

import com.eventhub.enums.RegistrationStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RegistrationResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long eventId;
    private String eventTitle;
    private LocalDateTime eventDate;
    private String venue;
    private RegistrationStatus status;
    private BigDecimal amountPaid;
    private String couponCode;
    private BigDecimal discount;
    private LocalDateTime createdAt;
    private TicketResponse ticket;
}
