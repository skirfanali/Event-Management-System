import api from '@/lib/axios';
import EP from '@/lib/endpoints';

const loadRazorpay = () => new Promise((resolve) => {
  if (typeof window !== 'undefined' && window.Razorpay) return resolve(true);
  const s = document.createElement('script');
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload  = () => resolve(true);
  s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

export const paymentService = {
  getMyPayments: (p) => api.get(EP.PAYMENTS.MY, { params: p }),
  createOrder:   (registrationId) => api.post(EP.PAYMENTS.CREATE_ORDER(registrationId)),
  verifyPayment: (d) => api.post(EP.PAYMENTS.VERIFY, d),

  initiatePayment: async ({ registration, user, onSuccess, onFailure, onDismiss }) => {
    const loaded = await loadRazorpay();
    if (!loaded) { onFailure?.('Razorpay SDK failed to load'); return; }

    let order;
    try {
      order = await api.post(EP.PAYMENTS.CREATE_ORDER(registration.id));
      console.log('[paymentService] createOrder response:', order);
    } catch (e) {
      console.error('[paymentService] createOrder failed:', e);
      onFailure?.(e.message || 'Failed to create payment order');
      return;
    }

    // axios interceptor unwraps { success, data } so order IS already the data object.
    // Backend returns: { orderId, amount (paise), currency, isFree, eventTitle, ... }
    // Defensively handle both wrapped and unwrapped just in case.
    const orderData = order?.orderId ? order : order?.data;

    if (!orderData) {
      console.error('[paymentService] Could not parse order response:', order);
      onFailure?.('Invalid response from payment server. Please try again.');
      return;
    }

    // ✅ FIX: Only bypass Razorpay if backend explicitly says isFree=true.
    // NEVER bypass based on amount being 0 — that could be a backend bug.
    if (orderData.isFree === true) {
      console.log('[paymentService] Free event — skipping Razorpay popup');
      try {
        await api.post(EP.PAYMENTS.VERIFY, {
          razorpayOrderId:   orderData.orderId,
          razorpayPaymentId: 'FREE',
          razorpaySignature: 'FREE',
        });
      } catch (e) {
        console.warn('[paymentService] Free event verify skipped:', e.message);
      }
      onSuccess?.({
        razorpay_payment_id: 'FREE',
        razorpay_order_id:   orderData.orderId,
        razorpay_signature:  'FREE',
      });
      return;
    }

    // ✅ Paid event — must have a real orderId and non-zero amount
    if (!orderData.orderId || !orderData.amount || orderData.amount <= 0) {
      console.error('[paymentService] Invalid order data for paid event:', orderData);
      onFailure?.('Payment order is invalid. Please try again.');
      return;
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY;
    if (!razorpayKey) {
      console.error('[paymentService] NEXT_PUBLIC_RAZORPAY_KEY is missing in .env.local');
      onFailure?.('Payment configuration error. Contact support.');
      return;
    }

    const options = {
      key:         razorpayKey,
      amount:      orderData.amount,        // in paise from backend
      currency:    orderData.currency || 'INR',
      name:        'CampusEvents',
      description: orderData.eventTitle || 'Event Registration',
      order_id:    orderData.orderId,       // ✅ real Razorpay order ID
      prefill: {
        name:    user?.name  || '',
        email:   user?.email || '',
        contact: user?.phone || '',
      },
      notes: { eventTitle: orderData.eventTitle },
      theme: { color: '#6366f1' },
      modal: { ondismiss: () => onDismiss?.() },
      handler: async (response) => {
        console.log('[paymentService] Razorpay success response:', response);
        try {
          const verified = await api.post(EP.PAYMENTS.VERIFY, {
            razorpayOrderId:   response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          onSuccess?.(verified);
        } catch (e) {
          console.error('[paymentService] verify failed:', e);
          onFailure?.(e.message || 'Payment verification failed');
        }
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r) => {
        console.error('[paymentService] payment.failed:', r.error);
        onFailure?.(r.error?.description || 'Payment failed');
      });
      rzp.open();
    } catch (e) {
      console.error('[paymentService] rzp.open() failed:', e);
      onFailure?.(e.message || 'Could not open Razorpay');
    }
  },
};