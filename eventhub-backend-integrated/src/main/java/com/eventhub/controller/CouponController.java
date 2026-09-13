package com.eventhub.controller;

import com.eventhub.dto.response.*;
import com.eventhub.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@Tag(name = "Coupons", description = "Coupon validation endpoint for users")
@SecurityRequirement(name = "Bearer Auth")
public class CouponController {

    private final CouponService couponService;

    @GetMapping("/validate")
    @Operation(summary = "Validate a coupon code and preview discount")
    public ResponseEntity<ApiResponse<CouponValidateResponse>> validate(
            @RequestParam String code,
            @RequestParam BigDecimal amount) {
        return ResponseEntity.ok(ApiResponse.success("Coupon validated",
                couponService.validate(code, amount)));
    }
}
