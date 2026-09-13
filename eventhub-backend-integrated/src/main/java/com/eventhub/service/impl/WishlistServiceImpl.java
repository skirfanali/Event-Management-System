package com.eventhub.service.impl;

import com.eventhub.dto.response.EventResponse;
import com.eventhub.entity.*;
import com.eventhub.exception.ResourceNotFoundException;
import com.eventhub.repository.*;
import com.eventhub.service.WishlistService;
import com.eventhub.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository    wishlistRepository;
    private final EventRepository       eventRepository;
    private final RegistrationRepository registrationRepository;
    private final SecurityUtil          securityUtil;

    @Override
    public void toggleWishlist(Long eventId) {
        User user = securityUtil.getCurrentUser();
        if (wishlistRepository.existsByUserIdAndEventId(user.getId(), eventId)) {
            wishlistRepository.deleteByUserIdAndEventId(user.getId(), eventId);
        } else {
            Event event = eventRepository.findByIdAndDeletedFalse(eventId)
                    .orElseThrow(() -> new ResourceNotFoundException("Event", eventId));
            wishlistRepository.save(Wishlist.builder().user(user).event(event).build());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponse> getMyWishlist() {
        User user = securityUtil.getCurrentUser();
        return wishlistRepository.findByUserId(user.getId()).stream()
                .map(w -> mapEvent(w.getEvent(), user.getId()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isWishlisted(Long eventId) {
        Long uid = securityUtil.getCurrentUserId();
        return wishlistRepository.existsByUserIdAndEventId(uid, eventId);
    }

    private EventResponse mapEvent(Event e, Long uid) {
        boolean registered = registrationRepository.existsByUserIdAndEventIdAndStatus(
            uid, e.getId(), com.eventhub.enums.RegistrationStatus.ACTIVE);
        return EventResponse.builder()
                .id(e.getId()).title(e.getTitle())
                .category(e.getCategory() != null ? e.getCategory().getName() : null)
                .organizerName(e.getOrganizer().getName())
                .eventDate(e.getEventDate()).venue(e.getVenue())
                .capacity(e.getCapacity()).registeredCount(e.getRegisteredCount())
                .price(e.getPrice()).isFree(e.isFree())
                .imageUrl(e.getImageUrl()).status(e.getStatus())
                .avgRating(e.getAvgRating()).reviewCount(e.getReviewCount())
                .wishlisted(true).registeredByCurrentUser(registered)
                .spotsLeft(Math.max(0, e.getCapacity() - e.getRegisteredCount()))
                .build();
    }
}
