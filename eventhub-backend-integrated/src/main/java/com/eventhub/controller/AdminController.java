package com.eventhub.controller;

import com.eventhub.dto.request.*;
import com.eventhub.dto.response.*;
import com.eventhub.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;


@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "Bearer Auth")
@Tag(name = "Admin", description = "Admin-only management APIs")
public class AdminController {

    private final UserService         userService;
    private final EventService        eventService;
    private final ReviewService       reviewService;
    private final CouponService       couponService;
    private final NotificationService notificationService;
    private final CertificateService  certificateService;
    private final PaymentService      paymentService;
    private final AnalyticsService    analyticsService;
    private final CategoryService     categoryService;
    private final AttendanceService   attendanceService;   // ← added

    // ── Dashboard ──────────────────────────────────────────────────────────────
    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats", analyticsService.getAdminDashboard()));
    }

    // ── Users ──────────────────────────────────────────────────────────────────
    @GetMapping("/users")
    @Operation(summary = "Get all users with search and pagination")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0")  int    page,
            @RequestParam(defaultValue = "20") int    size,
            @RequestParam(required = false)    String search) {
        return ResponseEntity.ok(ApiResponse.success("Users fetched",
                userService.getAllUsers(page, size, search)));
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User fetched", userService.getById(id)));
    }

    @PatchMapping("/users/{id}/toggle-status")
    @Operation(summary = "Toggle user active/blocked status")
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(@PathVariable Long id) {
        userService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.success("User status toggled"));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Permanently delete a user")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted"));
    }

    @GetMapping("/users/role/{role}")
    @Operation(summary = "Get users by role (USER, ORGANIZER, ADMIN)")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> getUsersByRole(
            @PathVariable String role,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Users by role",
                userService.getUsersByRole(role, page, size)));
    }

    // ── Events ─────────────────────────────────────────────────────────────────
    @GetMapping("/events")
    @Operation(summary = "Get all events (admin view)")
    public ResponseEntity<ApiResponse<PagedResponse<EventResponse>>> getAllEvents(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Events fetched",
                eventService.getAll(page, size, "createdAt", "desc")));
    }

    @DeleteMapping("/events/{id}")
    @Operation(summary = "Force delete any event")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable Long id) {
        eventService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Event deleted"));
    }

    // ── Attendance ─────────────────────────────────────────────────────────────
    @GetMapping("/events/{eventId}/attendance/stats")
    @Operation(summary = "Get attendance statistics for a specific event")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAttendanceStats(
            @PathVariable Long eventId) {
        return ResponseEntity.ok(ApiResponse.success("Attendance stats",
                attendanceService.getAttendanceStats(eventId)));
    }

    @GetMapping("/events/{eventId}/attendance")
    @Operation(summary = "Get attendance list for a specific event")
    public ResponseEntity<ApiResponse<PagedResponse<AttendanceResponse>>> getEventAttendance(
            @PathVariable Long eventId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Attendance list",
                attendanceService.getEventAttendance(eventId, page, size)));
    }

    // ── Reviews ────────────────────────────────────────────────────────────────
    @GetMapping("/reviews")
    @Operation(summary = "Get all reviews (admin moderation)")
    public ResponseEntity<ApiResponse<PagedResponse<ReviewResponse>>> getAllReviews(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Reviews fetched",
                reviewService.getAllReviews(page, size)));
    }

    @DeleteMapping("/reviews/{id}")
    @Operation(summary = "Delete any review")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted"));
    }

    // ── Categories ─────────────────────────────────────────────────────────────
    @PostMapping("/categories")
    @Operation(summary = "Create a new event category")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created", categoryService.create(request)));
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Update an event category")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Category updated", categoryService.update(id, request)));
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Deactivate a category")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Category deactivated"));
    }

    // ── Coupons ────────────────────────────────────────────────────────────────
    @GetMapping("/coupons")
    @Operation(summary = "Get all coupons")
    public ResponseEntity<ApiResponse<PagedResponse<CouponResponse>>> getAllCoupons(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Coupons fetched", couponService.getAll(page, size)));
    }

    @PostMapping("/coupons")
    @Operation(summary = "Create a new coupon")
    public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(@Valid @RequestBody CouponRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Coupon created", couponService.create(request)));
    }

    @PutMapping("/coupons/{id}")
    @Operation(summary = "Update a coupon")
    public ResponseEntity<ApiResponse<CouponResponse>> updateCoupon(
            @PathVariable Long id, @Valid @RequestBody CouponRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Coupon updated", couponService.update(id, request)));
    }

    @DeleteMapping("/coupons/{id}")
    @Operation(summary = "Deactivate a coupon")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deactivated"));
    }

    // ── Payments ───────────────────────────────────────────────────────────────
    @GetMapping("/payments")
    @Operation(summary = "Get all payments")
    public ResponseEntity<ApiResponse<PagedResponse<PaymentResponse>>> getAllPayments(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Payments fetched",
                paymentService.getAllPayments(page, size)));
    }

    // ── Notifications ──────────────────────────────────────────────────────────
    @PostMapping("/notifications/broadcast")
    @Operation(summary = "Broadcast a notification to all users")
    public ResponseEntity<ApiResponse<Void>> broadcast(@Valid @RequestBody NotificationRequest request) {
        notificationService.broadcastToAll(request.getType(), request.getTitle(), request.getMessage());
        return ResponseEntity.ok(ApiResponse.success("Notification broadcast sent"));
    }

    @PostMapping("/notifications/user")
    @Operation(summary = "Send notification to a specific user")
    public ResponseEntity<ApiResponse<NotificationResponse>> sendToUser(
            @Valid @RequestBody NotificationRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Notification sent",
                notificationService.create(request)));
    }

    // ── Certificates ───────────────────────────────────────────────────────────
    @PostMapping("/certificates/generate")
    @Operation(summary = "Generate certificate for a user who attended an event")
    public ResponseEntity<ApiResponse<CertificateResponse>> generateCertificate(
            @RequestParam Long eventId,
            @RequestParam Long userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Certificate generated",
                        certificateService.generate(eventId, userId)));
    }
    
 // ADD this endpoint in AdminController.java inside the Dashboard section
 // (right after the existing /dashboard GET)

 @GetMapping("/analytics")
 @Operation(summary = "Get admin chart data for reports page (revenue, growth, category, attendance)")
 public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminAnalytics() {
     return ResponseEntity.ok(ApiResponse.success("Analytics data", analyticsService.getAdminAnalytics()));
 }


 
}