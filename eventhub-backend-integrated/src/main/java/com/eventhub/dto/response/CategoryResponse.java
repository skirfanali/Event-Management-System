package com.eventhub.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String icon;
    private String color;
    private String description;
    private boolean active;
    private Long eventCount;
    private LocalDateTime createdAt;
}
