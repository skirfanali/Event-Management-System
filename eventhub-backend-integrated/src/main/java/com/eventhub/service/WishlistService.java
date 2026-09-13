package com.eventhub.service;

import com.eventhub.dto.response.EventResponse;

import java.util.List;

public interface WishlistService {
    void toggleWishlist(Long eventId);
    List<EventResponse> getMyWishlist();
    boolean isWishlisted(Long eventId);
}
