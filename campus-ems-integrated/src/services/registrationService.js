import api from '@/lib/axios';
import EP from '@/lib/endpoints';

export const registrationService = {
  // ✅ Creates a PENDING registration for paid events; ACTIVE + ticket for free events
  register:    (eventId, couponCode) => api.post(
    EP.REGISTRATIONS.REGISTER(eventId) + (couponCode ? `?couponCode=${couponCode}` : '')
  ),

  cancel:      (eventId) => api.delete(EP.REGISTRATIONS.CANCEL(eventId)),
  getMyList:   (page = 0, size = 10) => api.get(EP.REGISTRATIONS.MY, { params: { page, size } }),
  getEventList:(eventId, page = 0, size = 20) => api.get(EP.REGISTRATIONS.EVENT_LIST(eventId), { params: { page, size } }),
  isRegistered:(eventId) => api.get(EP.REGISTRATIONS.CHECK(eventId)),
};

/*
  ✅ CORRECT PAYMENT FLOW (handled by paymentService.js + backend PaymentServiceImpl):

  1. registrationService.register(eventId)
       → Backend creates Registration with status=PENDING (for paid events)
       → Returns { id: registrationId, amountPaid, ... }

  2. paymentService.initiatePayment({ registration, user, onSuccess, onFailure })
       → Calls POST /payments/create-order/:registrationId  (creates real Razorpay order)
       → Opens Razorpay popup

  3. On payment success → Razorpay calls handler()
       → Calls POST /payments/verify { razorpayOrderId, razorpayPaymentId, razorpaySignature }
       → Backend: verifies signature → sets Payment.status = SUCCESS
                → sets Registration.status = ACTIVE
                → calls ticketService.createTicket(registrationId)

  4. Frontend redirects to /payment/success with registrationId in sessionStorage
       → PaymentSuccessPage fetches ticket by registrationId
*/