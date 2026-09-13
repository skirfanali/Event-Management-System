package com.eventhub.service;

import com.eventhub.dto.request.ReviewRequest;
import com.eventhub.dto.response.PagedResponse;
import com.eventhub.dto.response.ReviewResponse;

public interface ReviewService {
    ReviewResponse addReview(Long eventId, ReviewRequest request);
    ReviewResponse updateReview(Long reviewId, ReviewRequest request);
    void deleteReview(Long reviewId);
    PagedResponse<ReviewResponse> getEventReviews(Long eventId, int page, int size);
    PagedResponse<ReviewResponse> getMyReviews(int page, int size);
    PagedResponse<ReviewResponse> getAllReviews(int page, int size);
}
