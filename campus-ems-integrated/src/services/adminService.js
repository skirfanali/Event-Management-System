import api from '@/lib/axios';
import EP from '@/lib/endpoints';

export const adminService = {
  getDashboard:      ()            => api.get(EP.ADMIN.DASHBOARD),
  getAnalytics:      ()            => api.get(EP.ADMIN.ANALYTICS),        // ← NEW

  // ── Users ────────────────────────────────────────────────────────────────
  getUsers:          (p)           => api.get(EP.ADMIN.USERS, { params: p }),
  getUserById:       (id)          => api.get(EP.ADMIN.USER(id)),
  toggleUserStatus:  (id)          => api.patch(EP.ADMIN.USER_TOGGLE(id)),
  deleteUser:        (id)          => api.delete(EP.ADMIN.USER(id)),
  getUsersByRole:    (role, p)     => api.get(EP.ADMIN.USERS_BY_ROLE(role), { params: p }),

  // ── Events ───────────────────────────────────────────────────────────────
  getEvents:         (p)           => api.get(EP.ADMIN.EVENTS, { params: p }),
  deleteEvent:       (id)          => api.delete(EP.ADMIN.EVENT_DELETE(id)),

  // ── Attendance ───────────────────────────────────────────────────────────
  getAttendanceStats:  (eventId)    => api.get(EP.ADMIN.ATTENDANCE_STATS(eventId)),
  getEventAttendance:  (eventId, p) => api.get(EP.ADMIN.ATTENDANCE_LIST(eventId), { params: p }),

  // ── Reviews ──────────────────────────────────────────────────────────────
  getReviews:        (p)           => api.get(EP.ADMIN.REVIEWS, { params: p }),
  deleteReview:      (id)          => api.delete(EP.ADMIN.REVIEW_DELETE(id)),

  // ── Categories ───────────────────────────────────────────────────────────
  createCategory:    (d)           => api.post(EP.ADMIN.CATEGORIES, d),
  updateCategory:    (id, d)       => api.put(EP.ADMIN.CATEGORY_UPDATE(id), d),
  deleteCategory:    (id)          => api.delete(EP.ADMIN.CATEGORY_DELETE(id)),

  // ── Coupons ──────────────────────────────────────────────────────────────
  getCoupons:        (p)           => api.get(EP.ADMIN.COUPONS, { params: p }),
  createCoupon:      (d)           => api.post(EP.ADMIN.COUPONS, d),
  updateCoupon:      (id, d)       => api.put(EP.ADMIN.COUPON_UPDATE(id), d),
  deleteCoupon:      (id)          => api.delete(EP.ADMIN.COUPON_DELETE(id)),

  // ── Payments ─────────────────────────────────────────────────────────────
  getPayments:       (p)           => api.get(EP.ADMIN.PAYMENTS, { params: p }),

  // ── Notifications ─────────────────────────────────────────────────────────
  broadcast:         (d)           => api.post(EP.ADMIN.NOTIFY_BROADCAST, d),
  notifyUser:        (d)           => api.post(EP.ADMIN.NOTIFY_USER, d),

  // ── Certificates ──────────────────────────────────────────────────────────
  generateCert:      (eventId, userId) =>
    api.post(`${EP.ADMIN.CERT_GENERATE}?eventId=${eventId}&userId=${userId}`),
};