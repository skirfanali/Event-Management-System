package com.eventhub.repository;

import com.eventhub.entity.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByTicketCode(String ticketCode);
    Optional<Ticket> findByQrData(String qrData);
    List<Ticket> findByUserId(Long userId);
    Page<Ticket> findByEventId(Long eventId, Pageable pageable);
    Optional<Ticket> findByRegistrationId(Long registrationId);
    boolean existsByUserIdAndEventId(Long userId, Long eventId);
    Long countByEventId(Long eventId);
}
