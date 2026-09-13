package com.eventhub.service;

import com.eventhub.dto.request.*;
import com.eventhub.dto.response.AuthResponse;
import com.eventhub.dto.response.UserResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(String refreshToken);
    void logout(String refreshToken);
    UserResponse getCurrentUser();
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    void verifyEmail(String token);
}
