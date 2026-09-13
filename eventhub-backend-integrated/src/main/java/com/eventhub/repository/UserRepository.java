package com.eventhub.repository;

import com.eventhub.entity.User;
import com.eventhub.enums.Role;
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
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByEmailVerificationToken(String token);
    Optional<User> findByPasswordResetToken(String token);
    Optional<User> findByRefreshToken(String token);
    Page<User> findByRole(Role role, Pageable pageable);
    Page<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email, Pageable pageable);
    Long countByRole(Role role);
    Long countByActive(boolean active);
    List<User> findAllByRole(Role role);
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
