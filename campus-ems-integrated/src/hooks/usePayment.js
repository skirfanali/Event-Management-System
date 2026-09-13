'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  validateCoupon,
  calculateSummary,
  initiateRazorpayPayment,
  completeRegistration,
  isAlreadyRegistered,
} from '@/services/paymentService';
import toast from 'react-hot-toast';

export function usePayment(event, user) {
  const router = useRouter();

  const [couponCode,  setCouponCode]  = useState('');
  const [coupon,      setCoupon]      = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [processing,  setProcessing]  = useState(false);
  const [paymentStep, setPaymentStep] = useState('summary'); // summary | processing | success | failed

  const summary = calculateSummary(event?.price || 0, coupon);

  // ── Apply Coupon ────────────────────────────────────────────────────────────
  const applyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    await new Promise(r => setTimeout(r, 600)); // simulate API call
    const result = validateCoupon(couponCode);
    if (result.valid) {
      setCoupon(result);
      toast.success(`Coupon "${result.code}" applied! ${result.description}`);
    } else {
      setCouponError(result.message);
      setCoupon(null);
    }
    setCouponLoading(false);
  }, [couponCode]);

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    setCouponCode('');
    setCouponError('');
    toast('Coupon removed');
  }, []);

  // ── Initiate Payment ────────────────────────────────────────────────────────
  const startPayment = useCallback(async () => {
    if (!event) return;

    // Duplicate registration guard
    if (user && isAlreadyRegistered(String(user.id || 'guest'), event.id)) {
      toast.error('You are already registered for this event!');
      router.push('/dashboard/tickets');
      return;
    }

    setProcessing(true);
    setPaymentStep('processing');

    await initiateRazorpayPayment({
      event,
      user,
      summary,
      coupon,

      onSuccess: async (paymentResponse) => {
        try {
          const result = await completeRegistration({ event, user, summary, coupon, paymentResponse });
          toast.success('Payment successful! Your ticket is ready 🎫');
          // Store result for success page
          sessionStorage.setItem('ems_last_payment', JSON.stringify({
            ticket:      result.ticket,
            payment:     result.payment,
            registration:result.registration,
            event,
          }));
          router.push('/payment/success');
        } catch (err) {
          toast.error('Payment received but ticket generation failed. Contact support.');
          router.push('/payment/failure');
        } finally {
          setProcessing(false);
        }
      },

      onFailure: (message) => {
        setProcessing(false);
        setPaymentStep('summary');
        sessionStorage.setItem('ems_payment_error', message || 'Payment was not completed');
        router.push('/payment/failure');
      },

      onDismiss: () => {
        setProcessing(false);
        setPaymentStep('summary');
        toast('Payment cancelled');
      },
    });
  }, [event, user, summary, coupon, router]);

  return {
    couponCode, setCouponCode,
    coupon, couponError, couponLoading,
    applyCoupon, removeCoupon,
    summary,
    processing, paymentStep,
    startPayment,
  };
}
