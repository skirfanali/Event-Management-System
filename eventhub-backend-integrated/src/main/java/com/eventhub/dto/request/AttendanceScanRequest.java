package com.eventhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AttendanceScanRequest {
    @NotBlank(message = "QR data is required")
    private String qrData;
}
