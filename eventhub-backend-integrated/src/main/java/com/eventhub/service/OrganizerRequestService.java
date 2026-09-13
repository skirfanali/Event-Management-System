package com.eventhub.service;

import com.eventhub.dto.request.AdminReviewRequest;
import com.eventhub.dto.request.OrganizerRegisterRequest;
import com.eventhub.dto.response.OrganizerRequestResponse;
import com.eventhub.dto.response.PagedResponse;

public interface OrganizerRequestService {
    OrganizerRequestResponse submit(OrganizerRegisterRequest request);
    PagedResponse<OrganizerRequestResponse> getAll(int page, int size, String status);
    OrganizerRequestResponse approve(Long id, AdminReviewRequest request);
    OrganizerRequestResponse reject(Long id, AdminReviewRequest request);
    long getPendingCount();
}