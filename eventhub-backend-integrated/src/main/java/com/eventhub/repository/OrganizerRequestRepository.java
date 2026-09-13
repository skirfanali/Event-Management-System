package com.eventhub.repository;

import com.eventhub.entity.OrganizerRequest;
import com.eventhub.enums.OrganizerRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizerRequestRepository extends JpaRepository<OrganizerRequest, Long> {
    boolean existsByEmailAndStatus(String email, OrganizerRequestStatus status);
    boolean existsByEmail(String email);
    Page<OrganizerRequest> findByStatus(OrganizerRequestStatus status, Pageable pageable);
    Page<OrganizerRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Optional<OrganizerRequest> findByEmail(String email);
    long countByStatus(OrganizerRequestStatus status);
}