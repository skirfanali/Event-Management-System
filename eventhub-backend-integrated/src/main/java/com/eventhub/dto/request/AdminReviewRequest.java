package com.eventhub.dto.request;

import lombok.Data;

@Data
public class AdminReviewRequest {
    private String adminNote; // optional note (shown to applicant on rejection)
}