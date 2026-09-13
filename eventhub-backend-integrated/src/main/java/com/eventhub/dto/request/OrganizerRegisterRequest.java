package com.eventhub.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class OrganizerRegisterRequest {
    @NotBlank @Size(min = 2, max = 100)
    private String name;

    @NotBlank @Email
    private String email;

    @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private String phone;
    private String organization;  // club / company / department
    private String designation;   // role title

    @NotBlank(message = "Please tell us why you want to be an organizer")
    @Size(min = 20, max = 1000, message = "Reason must be at least 20 characters")
    private String reason;
}