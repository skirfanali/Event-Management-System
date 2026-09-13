package com.eventhub.repository;

import com.eventhub.entity.Attendance;
import com.eventhub.enums.AttendanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByUserIdAndEventId(Long userId, Long eventId);
    boolean existsByUserIdAndEventId(Long userId, Long eventId);
    List<Attendance> findByEventId(Long eventId);
    Page<Attendance> findByEventId(Long eventId, Pageable pageable);
    Long countByEventId(Long eventId);
    Long countByEventIdAndStatus(Long eventId, AttendanceStatus status);

    // ✅ NEW: Get attendance records for a specific user (for user history page)
    Page<Attendance> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.event.id = :eventId AND a.status = 'PRESENT'")
    Long countPresentByEventId(@Param("eventId") Long eventId);
}