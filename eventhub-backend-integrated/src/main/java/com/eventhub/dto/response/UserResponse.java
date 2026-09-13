package com.eventhub.dto.response;

import com.eventhub.enums.Role;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String phone;
    // Student fields
    private String college;
    private String branch;
    private String year;
    // ✅ NEW: Organizer fields — fetched and returned to frontend
    private String organization;
    private String designation;
    private String website;
    private String bio;
    private String avatarUrl;
    private boolean active;
    private boolean emailVerified;
    private LocalDateTime createdAt;
}