package com.eventhub.service.impl;

import com.eventhub.dto.request.ReviewRequest;
import com.eventhub.dto.response.PagedResponse;
import com.eventhub.dto.response.ReviewResponse;
import com.eventhub.entity.*;
import com.eventhub.enums.Role;
import com.eventhub.exception.*;
import com.eventhub.repository.*;
import com.eventhub.service.ReviewService;
import com.eventhub.util.PageUtil;
import com.eventhub.util.SecurityUtil;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository   reviewRepository;
    private final EventRepository    eventRepository;
    private final SecurityUtil       securityUtil;

    @Override
    public ReviewResponse addReview(Long eventId, ReviewRequest request) {
        User user  = securityUtil.getCurrentUser();
        Event event = eventRepository.findByIdAndDeletedFalse(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", eventId));

        if (reviewRepository.existsByUserIdAndEventIdAndDeletedFalse(user.getId(), eventId)) {
            throw new BadRequestException("You have already reviewed this event");
        }

        Review review = Review.builder()
                .user(user).event(event)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        reviewRepository.save(review);
        updateEventRating(event);
        return toResponse(review);
    }

    @Override
    public ReviewResponse updateReview(Long reviewId, ReviewRequest request) {
        User user   = securityUtil.getCurrentUser();
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You can only update your own reviews");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        reviewRepository.save(review);
        updateEventRating(review.getEvent());
        return toResponse(review);
    }

    @Override
    public void deleteReview(Long reviewId) {
        User user   = securityUtil.getCurrentUser();
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        if (!review.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Not authorized to delete this review");
        }

        review.setDeleted(true);
        reviewRepository.save(review);
        updateEventRating(review.getEvent());
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ReviewResponse> getEventReviews(Long eventId, int page, int size) {
        Pageable pageable = PageUtil.createPageable(page, size, "createdAt", "desc");
        return PageUtil.toPagedResponse(
            reviewRepository.findByEventIdAndDeletedFalse(eventId, pageable).map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ReviewResponse> getMyReviews(int page, int size) {
        Long uid = securityUtil.getCurrentUserId();
        Pageable pageable = PageUtil.createPageable(page, size, "createdAt", "desc");
        return PageUtil.toPagedResponse(
            reviewRepository.findByUserIdAndDeletedFalse(uid, pageable).map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ReviewResponse> getAllReviews(int page, int size) {
        Pageable pageable = PageUtil.createPageable(page, size, "createdAt", "desc");
        return PageUtil.toPagedResponse(
            reviewRepository.findByDeletedFalse(pageable).map(this::toResponse));
    }

    private void updateEventRating(Event event) {

        Double avg = reviewRepository.getAverageRating(event.getId());
        Long count = reviewRepository.countByEventId(event.getId());

        BigDecimal avgRating = avg != null
                ? BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        event.setAvgRating(avgRating);
        event.setReviewCount(count.intValue());

        eventRepository.save(event);
    }

    private ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .userId(r.getUser().getId())
                .userName(r.getUser().getName())
                .userCollege(r.getUser().getCollege())
                .userAvatar(r.getUser().getAvatarUrl())
                .eventId(r.getEvent().getId())
                .eventTitle(r.getEvent().getTitle())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
