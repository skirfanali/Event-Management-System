package com.eventhub.repository;

import com.eventhub.entity.Registration;
import com.eventhub.enums.RegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    Optional<Registration> findByUserIdAndEventId(Long userId, Long eventId);
    boolean existsByUserIdAndEventIdAndStatus(Long userId, Long eventId, RegistrationStatus status);
    Page<Registration> findByUserId(Long userId, Pageable pageable);
    Page<Registration> findByEventId(Long eventId, Pageable pageable);
    List<Registration> findByEventIdAndStatus(Long eventId, RegistrationStatus status);
    Long countByEventId(Long eventId);
    Long countByEventIdAndStatus(Long eventId, RegistrationStatus status);

    @Query("SELECT COUNT(r) FROM Registration r WHERE r.status = 'ACTIVE'")
    Long countTotalActive();

    // ✅ NEW: Monthly registrations for organizer's events (last 6 months)
    @Query("SELECT FUNCTION('MONTH', r.createdAt), " +
           "FUNCTION('YEAR',  r.createdAt), " +
           "COUNT(r) " +
           "FROM Registration r " +
           "WHERE r.event.organizer.id = :organizerId " +
           "AND r.status = 'ACTIVE' " +
           "AND r.createdAt >= :since " +
           "GROUP BY FUNCTION('YEAR', r.createdAt), FUNCTION('MONTH', r.createdAt) " +
           "ORDER BY FUNCTION('YEAR', r.createdAt) ASC, FUNCTION('MONTH', r.createdAt) ASC")
    List<Object[]> getMonthlyRegistrationsByOrganizer(@Param("organizerId") Long organizerId,
                                                       @Param("since") LocalDateTime since);
    
    
    
    
 // ─────────────────────────────────────────────────────────────────────────────
 // ADD to RegistrationRepository.java
 // (the other 3 queries were already added in the previous analytics fix)
 // ─────────────────────────────────────────────────────────────────────────────

 // Platform-wide monthly registration count (no organizer filter)
 @Query("""
     SELECT MONTH(r.createdAt), YEAR(r.createdAt), COUNT(r)
     FROM Registration r
     WHERE r.status = 'ACTIVE'
       AND r.createdAt >= :since
     GROUP BY YEAR(r.createdAt), MONTH(r.createdAt)
     ORDER BY YEAR(r.createdAt), MONTH(r.createdAt)
     """)
 List<Object[]> getMonthlyRegistrationsPlatform(@Param("since") LocalDateTime since);



    
}