package com.eventhub.entity;

import com.eventhub.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String phone;

    // Student fields
    private String college;
    private String branch;
    private String year;

    // ✅ NEW: Organizer-specific fields (auto-added by Hibernate on restart)
    private String organization;
    private String designation;
    private String website;

    @Column(length = 500)
    private String bio;

    private String avatarUrl;
    private String avatarPublicId;

    @Column(nullable = false) @Builder.Default
    private boolean active = true;

    @Column(nullable = false) @Builder.Default
    private boolean emailVerified = false;

    private String emailVerificationToken;
    private LocalDateTime emailVerificationExpiry;
    private String passwordResetToken;
    private LocalDateTime passwordResetExpiry;
    private String refreshToken;
    private LocalDateTime refreshTokenExpiry;

    @OneToMany(mappedBy = "organizer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default private List<Event> organizedEvents = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default private List<Registration> registrations = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default private List<Review> reviews = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default private List<Notification> notifications = new ArrayList<>();
}