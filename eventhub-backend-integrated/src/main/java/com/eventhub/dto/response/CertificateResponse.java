package com.eventhub.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CertificateResponse {
    private Long id;
    private String certificateCode;
    private Long userId;
    private String userName;
    private Long eventId;
    private String eventTitle;
    private String fileUrl;
    private LocalDateTime issuedAt;
}
