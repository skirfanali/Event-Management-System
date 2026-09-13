package com.eventhub.service;

import com.eventhub.dto.request.PaymentVerifyRequest;
import com.eventhub.dto.response.PagedResponse;
import com.eventhub.dto.response.PaymentResponse;

import java.util.Map;

public interface PaymentService {
    Map<String, Object> createOrder(Long registrationId);
    PaymentResponse verifyPayment(PaymentVerifyRequest request);
    PagedResponse<PaymentResponse> getMyPayments(int page, int size);
    PagedResponse<PaymentResponse> getAllPayments(int page, int size);
}
