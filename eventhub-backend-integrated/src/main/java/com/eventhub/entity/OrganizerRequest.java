package com.eventhub.entity;

import com.eventhub.enums.OrganizerRequestStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "organizer_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrganizerRequest {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // stored hashed

    private String organization;
    private String designation;
    private String phone;

    @Column(length = 1000)
    private String reason; // why they want to be an organizer

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrganizerRequestStatus status = OrganizerRequestStatus.PENDING;

    private String adminNote; // optional rejection reason from admin

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime reviewedAt;
}