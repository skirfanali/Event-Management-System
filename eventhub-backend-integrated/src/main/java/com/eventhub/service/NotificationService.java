package com.eventhub.service;

import com.eventhub.dto.request.NotificationRequest;
import com.eventhub.dto.response.NotificationResponse;
import com.eventhub.dto.response.PagedResponse;
import com.eventhub.enums.NotificationType;

public interface NotificationService {
    NotificationResponse create(NotificationRequest request);
    void createForUser(Long userId, NotificationType type, String title, String message);
    void broadcastToAll(NotificationType type, String title, String message);
    PagedResponse<NotificationResponse> getMyNotifications(int page, int size);
    void markRead(Long id);
    void markAllRead();
    Long getUnreadCount();
    void deleteRead();
}
