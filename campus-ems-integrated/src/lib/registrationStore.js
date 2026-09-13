/**
 * registrationStore.js
 * Single source of truth for registrations, tickets, payments stored in localStorage.
 * Components → Hooks → Services → this store.
 */

const KEYS = {
  REGISTRATIONS: 'ems_registrations',
  TICKETS:       'ems_tickets',
  PAYMENTS:      'ems_payments',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const load = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
};
const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const uid = () => Math.random().toString(36).slice(2, 10).toUpperCase();
const ticketId = () => {
  const year = new Date().getFullYear();
  const seq  = String((load(KEYS.TICKETS).length + 1)).padStart(4, '0');
  return `TKT-${year}-${seq}`;
};
const paymentId  = () => `PAY-${Date.now()}-${uid()}`;
const regId      = () => `REG-${uid()}`;

// ─── Registrations ────────────────────────────────────────────────────────────
export const registrationStore = {
  getAll: () => load(KEYS.REGISTRATIONS),

  getByUser: (userId) => load(KEYS.REGISTRATIONS).filter(r => r.userId === userId),

  getByEvent: (eventId) => load(KEYS.REGISTRATIONS).filter(r => r.eventId === String(eventId)),

  isRegistered: (userId, eventId) =>
    load(KEYS.REGISTRATIONS).some(
      r => r.userId === userId && r.eventId === String(eventId) && r.paymentStatus === 'SUCCESS'
    ),

  create: ({ userId, eventId, eventTitle, eventDate, venue, amount, paymentId: pid, paymentGateway }) => {
    const reg = {
      registrationId:  regId(),
      userId,
      eventId:         String(eventId),
      eventTitle,
      eventDate,
      venue,
      amount,
      paymentId:       pid,
      paymentGateway,
      paymentStatus:   'SUCCESS',
      registrationDate: new Date().toISOString(),
    };
    const all = load(KEYS.REGISTRATIONS);
    all.push(reg);
    save(KEYS.REGISTRATIONS, all);
    return reg;
  },
};

// ─── Tickets ──────────────────────────────────────────────────────────────────
export const ticketStore = {
  getAll: () => load(KEYS.TICKETS),

  getByUser: (userId) => load(KEYS.TICKETS).filter(t => t.userId === userId),

  getById: (ticketId) => load(KEYS.TICKETS).find(t => t.ticketId === ticketId) || null,

  getByRegistration: (registrationId) =>
    load(KEYS.TICKETS).find(t => t.registrationId === registrationId) || null,

  create: ({ registrationId, userId, userName, userEmail, eventId, eventTitle, eventDate, venue, price }) => {
    const id  = ticketId();
    const qrData = JSON.stringify({ ticketId: id, userId, eventId: String(eventId), registrationId, ts: Date.now() });
    const ticket = {
      ticketId:        id,
      registrationId,
      userId,
      userName,
      userEmail,
      eventId:         String(eventId),
      eventTitle,
      eventDate,
      venue,
      price,
      status:          'CONFIRMED',
      qrData,
      issuedAt:        new Date().toISOString(),
    };
    const all = load(KEYS.TICKETS);
    all.push(ticket);
    save(KEYS.TICKETS, all);
    return ticket;
  },
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentStore = {
  getAll: () => load(KEYS.PAYMENTS),

  getByUser: (userId) => load(KEYS.PAYMENTS).filter(p => p.userId === userId),

  getById: (id) => load(KEYS.PAYMENTS).find(p => p.paymentId === id) || null,

  create: ({ userId, eventId, eventTitle, amount, currency = 'INR', gateway, gatewayOrderId, gatewayPaymentId, status = 'SUCCESS', discount = 0, couponCode = null }) => {
    const payment = {
      paymentId:        paymentId(),
      userId,
      eventId:          String(eventId),
      eventTitle,
      amount,
      currency,
      gateway,
      gatewayOrderId:   gatewayOrderId || `ORDER_${uid()}`,
      gatewayPaymentId: gatewayPaymentId || `PAY_${uid()}`,
      status,
      discount,
      couponCode,
      createdAt:        new Date().toISOString(),
    };
    const all = load(KEYS.PAYMENTS);
    all.push(payment);
    save(KEYS.PAYMENTS, all);
    return payment;
  },

  updateStatus: (paymentId, status) => {
    const all = load(KEYS.PAYMENTS).map(p =>
      p.paymentId === paymentId ? { ...p, status } : p
    );
    save(KEYS.PAYMENTS, all);
  },
};

// ─── Coupons (mock) ───────────────────────────────────────────────────────────
const MOCK_COUPONS = [
  { code: 'SAVE10',   type: 'PERCENT', value: 10,  description: '10% off on any event' },
  { code: 'FEST20',   type: 'PERCENT', value: 20,  description: '20% off on fest events' },
  { code: 'WELCOME50',type: 'FLAT',    value: 50,  description: '₹50 flat discount' },
  { code: 'TECH100',  type: 'FLAT',    value: 100, description: '₹100 off on tech events' },
  { code: 'FREE',     type: 'PERCENT', value: 100, description: '100% off — free ticket!' },
];

export const couponStore = {
  validate: (code) => {
    const c = MOCK_COUPONS.find(c => c.code === code.toUpperCase().trim());
    return c ? { valid: true, ...c } : { valid: false, message: 'Invalid or expired coupon' };
  },

  applyDiscount: (amount, coupon) => {
    if (!coupon) return 0;
    if (coupon.type === 'PERCENT') return Math.min(amount, Math.round((amount * coupon.value) / 100));
    return Math.min(amount, coupon.value);
  },
};
