package com.eventhub.dto.request;

import com.eventhub.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationRequest {
    @NotNull private Long userId;
    @NotNull private NotificationType type;
    @NotBlank private String title;
    @NotBlank private String message;
}
