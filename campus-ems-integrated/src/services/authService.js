import api from '@/lib/axios';
import EP from '@/lib/endpoints';

export const authService = {
  login:          (d)  => api.post(EP.AUTH.LOGIN, d),
  register:       (d)  => api.post(EP.AUTH.REGISTER, d),
  logout:         (rt) => api.post(`${EP.AUTH.LOGOUT}?refreshToken=${rt}`),
  forgotPassword: (e)  => api.post(EP.AUTH.FORGOT_PASSWORD, { email: e }),
  resetPassword:  (d)  => api.post(EP.AUTH.RESET_PASSWORD, d),
  verifyEmail:    (t)  => api.get(`${EP.AUTH.VERIFY_EMAIL}?token=${t}`),
  resendVerification: (e) => api.post(EP.AUTH.RESEND_VERIFICATION, { email: e }),
  getMe:          ()   => api.get(EP.AUTH.ME),
  refreshToken:   (rt) => api.post(`${EP.AUTH.REFRESH}?refreshToken=${rt}`),
};