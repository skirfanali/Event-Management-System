package com.eventhub.service;

import com.eventhub.dto.request.CouponRequest;
import com.eventhub.dto.response.CouponResponse;
import com.eventhub.dto.response.CouponValidateResponse;
import com.eventhub.dto.response.PagedResponse;

import java.math.BigDecimal;

public interface CouponService {
    CouponResponse create(CouponRequest request);
    CouponResponse update(Long id, CouponRequest request);
    void delete(Long id);
    CouponResponse getById(Long id);
    PagedResponse<CouponResponse> getAll(int page, int size);
    CouponValidateResponse validate(String code, BigDecimal amount);
    BigDecimal applyDiscount(String code, BigDecimal amount);
}
