package com.eventhub.service;

import com.eventhub.dto.response.PagedResponse;
import com.eventhub.dto.response.RegistrationResponse;

public interface RegistrationService {
    RegistrationResponse register(Long eventId, String couponCode);
    void cancelRegistration(Long eventId);
    PagedResponse<RegistrationResponse> getMyRegistrations(int page, int size);
    PagedResponse<RegistrationResponse> getEventRegistrations(Long eventId, int page, int size);
    boolean isRegistered(Long eventId);
}
