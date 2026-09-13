package com.eventhub.repository;

import com.eventhub.entity.Payment;
import com.eventhub.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

	Page<Payment> findByUserId(Long userId, Pageable pageable);

	Optional<Payment> findByRazorpayOrderId(String orderId);

	Optional<Payment> findByRegistrationId(Long registrationId);

	Long countByStatus(PaymentStatus status);

	@Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'SUCCESS'")
	BigDecimal getTotalRevenue();

	// Keep old method for backward compat (unused but safe)
	@Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'SUCCESS' AND p.user.id = :userId")
	BigDecimal getTotalRevenueByUser(@Param("userId") Long userId);

	// ✅ FIX: Revenue earned FROM organizer's events (not payments made BY organizer
	// as buyer)
	@Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p " + "WHERE p.status = 'SUCCESS' "
			+ "AND p.registration.event.organizer.id = :organizerId")
	BigDecimal getTotalRevenueByOrganizer(@Param("organizerId") Long organizerId);

	// ✅ NEW: Monthly revenue breakdown for organizer's chart (last 6 months)
	@Query("SELECT FUNCTION('MONTH', p.createdAt), " + "FUNCTION('YEAR',  p.createdAt), "
			+ "COALESCE(SUM(p.amount), 0) " + "FROM Payment p " + "WHERE p.status = 'SUCCESS' "
			+ "AND p.registration.event.organizer.id = :organizerId " + "AND p.createdAt >= :since "
			+ "GROUP BY FUNCTION('YEAR', p.createdAt), FUNCTION('MONTH', p.createdAt) "
			+ "ORDER BY FUNCTION('YEAR', p.createdAt) ASC, FUNCTION('MONTH', p.createdAt) ASC")
	
	
	
	
	
	List<Object[]> getMonthlyRevenueByOrganizer(@Param("organizerId") Long organizerId,
			@Param("since") LocalDateTime since);
	
	
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