package com.eventhub.service.impl;

import com.eventhub.dto.request.CouponRequest;
import com.eventhub.dto.response.CouponResponse;
import com.eventhub.dto.response.CouponValidateResponse;
import com.eventhub.dto.response.PagedResponse;
import com.eventhub.entity.Coupon;
import com.eventhub.enums.CouponType;
import com.eventhub.exception.*;
import com.eventhub.repository.CouponRepository;
import com.eventhub.service.CouponService;
import com.eventhub.util.PageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    @Override
    public CouponResponse create(CouponRequest request) {
        if (couponRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new BadRequestException("Coupon code already exists: " + request.getCode());
        }
        Coupon coupon = Coupon.builder()
                .code(request.getCode().toUpperCase())
                .type(request.getType())
                .value(request.getValue())
                .usageLimit(request.getUsageLimit())
                .expiresAt(request.getExpiresAt())
                .description(request.getDescription())
                .active(true)
                .build();
        return toResponse(couponRepository.save(coupon));
    }

    @Override
    public CouponResponse update(Long id, CouponRequest request) {
        Coupon c = getOrThrow(id);
        c.setType(request.getType());
        c.setValue(request.getValue());
        c.setUsageLimit(request.getUsageLimit());
        c.setExpiresAt(request.getExpiresAt());
        c.setDescription(request.getDescription());
        return toResponse(couponRepository.save(c));
    }

    @Override
    public void delete(Long id) {
        Coupon c = getOrThrow(id);
        c.setActive(false);
        couponRepository.save(c);
    }

    @Override
    @Transactional(readOnly = true)
    public CouponResponse getById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<CouponResponse> getAll(int page, int size) {
        Pageable pageable = PageUtil.createPageable(page, size, "createdAt", "desc");
        return PageUtil.toPagedResponse(couponRepository.findAll(pageable).map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public CouponValidateResponse validate(String code, BigDecimal amount) {
        Coupon c = couponRepository.findByCodeIgnoreCaseAndActiveTrue(code).orElse(null);
        if (c == null) return invalid("Invalid or expired coupon code");
        if (c.getExpiresAt() != null && c.getExpiresAt().isBefore(LocalDateTime.now())) return invalid("Coupon has expired");
        if (c.getUsedCount() >= c.getUsageLimit()) return invalid("Coupon usage limit reached");

        BigDecimal discount = computeDiscount(c, amount);
        return CouponValidateResponse.builder()
                .valid(true).code(c.getCode()).type(c.getType())
                .value(c.getValue()).discountAmount(discount)
                .description(c.getDescription()).build();
    }

    @Override
    public BigDecimal applyDiscount(String code, BigDecimal amount) {
        Coupon c = couponRepository.findByCodeIgnoreCaseAndActiveTrue(code)
                .orElseThrow(() -> new BadRequestException("Invalid coupon: " + code));
        c.setUsedCount(c.getUsedCount() + 1);
        couponRepository.save(c);
        return computeDiscount(c, amount);
    }

    private BigDecimal computeDiscount(Coupon c, BigDecimal amount) {
        if (c.getType() == CouponType.PERCENT) {
            return amount.multiply(c.getValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                    .min(amount);
        }
        return c.getValue().min(amount);
    }

    private CouponValidateResponse invalid(String msg) {
        return CouponValidateResponse.builder().valid(false).message(msg).build();
    }

    private Coupon getOrThrow(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", id));
    }

    private CouponResponse toResponse(Coupon c) {
        return CouponResponse.builder()
                .id(c.getId()).code(c.getCode()).type(c.getType())
                .value(c.getValue()).usageLimit(c.getUsageLimit())
                .usedCount(c.getUsedCount()).active(c.isActive())
                .description(c.getDescription()).expiresAt(c.getExpiresAt())
                .build();
    }
}
