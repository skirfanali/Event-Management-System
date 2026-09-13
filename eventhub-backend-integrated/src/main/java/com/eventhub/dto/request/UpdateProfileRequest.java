package com.eventhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank @Size(min = 2, max = 100)
    private String name;
    private String phone;
    // Student fields
    private String college;
    private String branch;
    private String year;
    // ✅ NEW: Organizer fields
    private String organization;
    private String designation;
    private String website;
    @Size(max = 500)
    private String bio;
}