package com.eventhub.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userCollege;
    private String userAvatar;
    private Long eventId;
    private String eventTitle;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
