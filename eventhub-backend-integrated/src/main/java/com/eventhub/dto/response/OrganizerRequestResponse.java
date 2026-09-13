package com.eventhub.dto.response;

import com.eventhub.enums.OrganizerRequestStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrganizerRequestResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String organization;
    private String designation;
    private String reason;
    private OrganizerRequestStatus status;
    private String adminNote;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
}