package com.eventhub.service.impl;

import com.eventhub.dto.request.*;
import com.eventhub.dto.response.AuthResponse;
import com.eventhub.dto.response.UserResponse;
import com.eventhub.entity.User;
import com.eventhub.exception.*;
import com.eventhub.repository.UserRepository;
import com.eventhub.security.JwtUtil;
import com.eventhub.security.UserDetailsServiceImpl;
import com.eventhub.service.AuthService;
import com.eventhub.util.EmailUtil;
import com.eventhub.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository        userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final JwtUtil               jwtUtil;
    private final AuthenticationManager authManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final EmailUtil             emailUtil;
    private final ModelMapper           modelMapper;
    private final SecurityUtil          securityUtil;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        String verificationToken = UUID.randomUUID().toString();

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .college(request.getCollege())
                .branch(request.getBranch())
                .year(request.getYear())
                .phone(request.getPhone())
                .emailVerificationToken(verificationToken)
                .emailVerificationExpiry(LocalDateTime.now().plusHours(24))
                .active(true)
                .emailVerified(false)
                .build();

        user = userRepository.save(user);
        emailUtil.sendVerificationEmail(user.getEmail(), user.getName(), verificationToken);

        // ✅ FIX: previously issued access/refresh tokens here, which logged
        // the user straight in and skipped email verification entirely.
        // No tokens are issued until the user verifies their email and logs in.
        log.info("New user registered (pending email verification): {} [{}]", user.getEmail(), user.getRole());
        return buildAuthResponse(user, null, null);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        try {
            authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("Invalid email or password");
        } catch (DisabledException e) {
            throw new UnauthorizedException("Account is disabled. Contact support.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", 0L));

        // ✅ FIX: login previously issued tokens regardless of verification
        // status, so an unverified account could log in anyway.
        if (!user.isEmailVerified()) {
            throw new UnauthorizedException("Please verify your email before logging in. Check your inbox for the verification link.");
        }

        UserDetails ud = userDetailsService.loadUserByUsername(user.getEmail());
        String access  = jwtUtil.generateAccessToken(ud);
        String refresh = jwtUtil.generateRefreshToken(ud);

        user.setRefreshToken(refresh);
        user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));
        userRepository.save(user);

        log.info("User logged in: {}", user.getEmail());
        return buildAuthResponse(user, access, refresh);
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        User user = userRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (user.getRefreshTokenExpiry() == null ||
            user.getRefreshTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token expired. Please login again.");
        }

        UserDetails ud    = userDetailsService.loadUserByUsername(user.getEmail());
        String newAccess  = jwtUtil.generateAccessToken(ud);
        String newRefresh = jwtUtil.generateRefreshToken(ud);

        user.setRefreshToken(newRefresh);
        user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));
        userRepository.save(user);

        return buildAuthResponse(user, newAccess, newRefresh);
    }

    @Override
    public void logout(String refreshToken) {
        userRepository.findByRefreshToken(refreshToken).ifPresent(user -> {
            user.setRefreshToken(null);
            user.setRefreshTokenExpiry(null);
            userRepository.save(user);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        User user = securityUtil.getCurrentUser();
        return modelMapper.map(user, UserResponse.class);
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setPasswordResetToken(token);
            user.setPasswordResetExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);
            emailUtil.sendPasswordResetEmail(user.getEmail(), user.getName(), token);
        });
        // Always return success to avoid email enumeration
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (user.getPasswordResetExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired. Request a new one.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiry(null);
        userRepository.save(user);
    }

    @Override
    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid verification token"));

        if (user.getEmailVerificationExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Verification token has expired. Request a new one.");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiry(null);
        userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(User user, String access, String refresh) {
        return AuthResponse.builder()
                .accessToken(access)
                .refreshToken(refresh)
                .tokenType("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .emailVerified(user.isEmailVerified())
                .build();
    }
}