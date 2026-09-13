package com.eventhub.dto.response;

import com.eventhub.enums.AttendanceStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AttendanceResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long eventId;
    private String eventTitle;
    private AttendanceStatus status;
    private LocalDateTime checkedInAt;
    private String ticketCode;
}
