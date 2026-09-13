package com.eventhub.service.impl;

import com.eventhub.dto.request.NotificationRequest;
import com.eventhub.dto.response.NotificationResponse;
import com.eventhub.dto.response.PagedResponse;
import com.eventhub.entity.*;
import com.eventhub.enums.NotificationType;
import com.eventhub.exception.ResourceNotFoundException;
import com.eventhub.repository.*;
import com.eventhub.service.NotificationService;
import com.eventhub.util.PageUtil;
import com.eventhub.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository         userRepository;
    private final SecurityUtil           securityUtil;
    private final SimpMessagingTemplate  messagingTemplate;

    @Override
    public NotificationResponse create(NotificationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getUserId()));
        Notification n = save(user, request.getType(), request.getTitle(), request.getMessage());
        pushWebSocket(user.getId(), toResponse(n));
        return toResponse(n);
    }

    @Override
    public void createForUser(Long userId, NotificationType type, String title, String message) {
        userRepository.findById(userId).ifPresent(user -> {
            Notification n = save(user, type, title, message);
            pushWebSocket(userId, toResponse(n));
        });
    }

    @Override
    public void broadcastToAll(NotificationType type, String title, String message) {
        userRepository.findAll().forEach(user ->
            save(user, type, title, message));
        messagingTemplate.convertAndSend("/topic/notifications",
            NotificationResponse.builder().type(type).title(title).message(message).build());
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<NotificationResponse> getMyNotifications(int page, int size) {
        Long userId = securityUtil.getCurrentUserId();
        Pageable pageable = PageUtil.createPageable(page, size, "createdAt", "desc");
        return PageUtil.toPagedResponse(
            notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toResponse));
    }

    @Override
    public void markRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Override
    public void markAllRead() {
        notificationRepository.markAllReadByUserId(securityUtil.getCurrentUserId());
    }

    @Override
    @Transactional(readOnly = true)
    public Long getUnreadCount() {
        return notificationRepository.countByUserIdAndReadFalse(securityUtil.getCurrentUserId());
    }

    @Override
    public void deleteRead() {
        notificationRepository.deleteReadByUserId(securityUtil.getCurrentUserId());
    }

    private Notification save(User user, NotificationType type, String title, String message) {
        return notificationRepository.save(Notification.builder()
                .user(user).type(type).title(title).message(message).read(false).build());
    }

    private void pushWebSocket(Long userId, NotificationResponse response) {
        messagingTemplate.convertAndSendToUser(String.valueOf(userId), "/queue/notifications", response);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId()).type(n.getType()).title(n.getTitle())
                .message(n.getMessage()).read(n.isRead()).createdAt(n.getCreatedAt()).build();
    }
}
