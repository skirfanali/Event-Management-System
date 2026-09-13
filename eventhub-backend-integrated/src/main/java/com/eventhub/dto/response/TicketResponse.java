package com.eventhub.dto.response;

import com.eventhub.enums.TicketStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TicketResponse {
    private Long id;
    private String ticketCode;
    // ✅ FIX: Added registrationId so frontend can match ticket to registration
    private Long registrationId;
    private Long eventId;
    private String eventTitle;
    private LocalDateTime eventDate;
    private String venue;
    private String attendeeName;
    private String attendeeEmail;
    private TicketStatus status;
    private BigDecimal price;
    private String qrData;
    private LocalDateTime createdAt;
}