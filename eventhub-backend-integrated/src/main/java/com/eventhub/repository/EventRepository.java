package com.eventhub.repository;

import com.eventhub.entity.Event;
import com.eventhub.enums.EventStatus;
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
public interface EventRepository extends JpaRepository<Event, Long> {

    Optional<Event> findByIdAndDeletedFalse(Long id);
    Page<Event> findByDeletedFalse(Pageable pageable);
    Page<Event> findByOrganizerIdAndDeletedFalse(Long organizerId, Pageable pageable);
    Page<Event> findByStatusAndDeletedFalse(EventStatus status, Pageable pageable);

    @Query("SELECT e FROM Event e WHERE e.deleted = false AND " +
           "(:search IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%',:search,'%')) " +
           "OR LOWER(e.description) LIKE LOWER(CONCAT('%',:search,'%'))) AND " +
           "(:category IS NULL OR e.category.name = :category) AND " +
           "(:isFree IS NULL OR e.isFree = :isFree) AND " +
           "(:status IS NULL OR e.status = :status)")
    Page<Event> searchEvents(@Param("search") String search,
                              @Param("category") String category,
                              @Param("isFree") Boolean isFree,
                              @Param("status") EventStatus status,
                              Pageable pageable);

    @Query("SELECT e FROM Event e WHERE e.deleted = false ORDER BY e.registeredCount DESC")
    List<Event> findTopByRegisteredCount(Pageable pageable);

    @Query("SELECT e FROM Event e WHERE e.deleted = false AND e.avgRating >= 4.0 ORDER BY e.avgRating DESC")
    List<Event> findFeatured(Pageable pageable);

    Long countByStatusAndDeletedFalse(EventStatus status);
    Long countByDeletedFalse();

    // ✅ NEW: Category breakdown for organizer's events (for CategoryChart)
    @Query("SELECT e.category.name, COUNT(e) " +
           "FROM Event e " +
           "WHERE e.deleted = false AND e.organizer.id = :organizerId " +
           "GROUP BY e.category.name " +
           "ORDER BY COUNT(e) DESC")
    List<Object[]> countEventsByCategory(@Param("organizerId") Long organizerId);
    
    
 // ─────────────────────────────────────────────────────────────────────────────
 // ADD these queries to your existing repository interfaces
 // ─────────────────────────────────────────────────────────────────────────────


 // ── PaymentRepository.java ────────────────────────────────────────────────────
 // Add alongside getMonthlyRevenueByOrganizer — same shape, no organizer filter

 @Query("""
     SELECT MONTH(p.createdAt), YEAR(p.createdAt), SUM(p.amount)
     FROM Payment p
     WHERE p.status = 'SUCCESS'
       AND p.createdAt >= :since
     GROUP BY YEAR(p.createdAt), MONTH(p.createdAt)
     ORDER BY YEAR(p.createdAt), MONTH(p.createdAt)
     """)
 List<Object[]> getMonthlyRevenuePlatform(@Param("since") LocalDateTime since);


 // ── UserRepository.java ───────────────────────────────────────────────────────
 // Monthly new user signups (role=USER only, to match totalUsers on dashboard)

 @Query("""
     SELECT MONTH(u.createdAt), YEAR(u.createdAt), COUNT(u)
     FROM User u
     WHERE u.role = 'USER'
       AND u.createdAt >= :since
     GROUP BY YEAR(u.createdAt), MONTH(u.createdAt)
     ORDER BY YEAR(u.createdAt), MONTH(u.createdAt)
     """)
 List<Object[]> getMonthlyUserGrowth(@Param("since") LocalDateTime since);


 // ── EventRepository.java ──────────────────────────────────────────────────────
 // Monthly new events created platform-wide

 @Query("""
     SELECT MONTH(e.createdAt), YEAR(e.createdAt), COUNT(e)
     FROM Event e
     WHERE e.deleted = false
       AND e.createdAt >= :since
     GROUP BY YEAR(e.createdAt), MONTH(e.createdAt)
     ORDER BY YEAR(e.createdAt), MONTH(e.createdAt)
     """)
 List<Object[]> getMonthlyEventGrowth(@Param("since") LocalDateTime since);

 // Category breakdown platform-wide (organizer version already exists as countEventsByCategory)
 @Query("""
     SELECT c.name, COUNT(e)
     FROM Event e
     JOIN e.category c
     WHERE e.deleted = false
     GROUP BY c.name
     ORDER BY COUNT(e) DESC
     """)
 List<Object[]> countAllEventsByCategory();
}