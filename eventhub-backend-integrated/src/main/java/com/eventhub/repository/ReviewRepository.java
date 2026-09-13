package com.eventhub.repository;

import com.eventhub.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByEventIdAndDeletedFalse(Long eventId, Pageable pageable);
    Page<Review> findByUserIdAndDeletedFalse(Long userId, Pageable pageable);
    Optional<Review> findByUserIdAndEventIdAndDeletedFalse(Long userId, Long eventId);
    boolean existsByUserIdAndEventIdAndDeletedFalse(Long userId, Long eventId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.event.id = :eventId AND r.deleted = false")
    Double getAverageRating(Long eventId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.event.id = :eventId AND r.deleted = false")
    Long countByEventId(Long eventId);

    Page<Review> findByDeletedFalse(Pageable pageable);
}
