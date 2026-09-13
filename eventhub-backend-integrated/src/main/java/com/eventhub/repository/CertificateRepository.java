package com.eventhub.repository;

import com.eventhub.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    List<Certificate> findByUserId(Long userId);
    Optional<Certificate> findByUserIdAndEventId(Long userId, Long eventId);
    Optional<Certificate> findByCertificateCode(String code);
    boolean existsByUserIdAndEventId(Long userId, Long eventId);
}
