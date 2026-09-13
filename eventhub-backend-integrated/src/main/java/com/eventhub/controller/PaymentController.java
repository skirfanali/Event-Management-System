package com.eventhub.controller;

import com.eventhub.dto.request.PaymentVerifyRequest;
import com.eventhub.dto.response.*;
import com.eventhub.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Razorpay payment integration")
@SecurityRequirement(name = "Bearer Auth")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order/{registrationId}")
    @Operation(summary = "Create Razorpay payment order")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createOrder(@PathVariable Long registrationId) {
        return ResponseEntity.ok(ApiResponse.success("Order created", paymentService.createOrder(registrationId)));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify Razorpay payment signature")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyPayment(
            @Valid @RequestBody PaymentVerifyRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Payment verified!", paymentService.verifyPayment(request)));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's payment history")
    public ResponseEntity<ApiResponse<PagedResponse<PaymentResponse>>> getMyPayments(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Payment history", paymentService.getMyPayments(page, size)));
    }
}
