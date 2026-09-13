package com.eventhub.service;

import com.eventhub.dto.request.ChangePasswordRequest;
import com.eventhub.dto.request.UpdateProfileRequest;
import com.eventhub.dto.response.PagedResponse;
import com.eventhub.dto.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    UserResponse getById(Long id);
    UserResponse updateProfile(UpdateProfileRequest request);
    String uploadAvatar(MultipartFile file);
    void changePassword(ChangePasswordRequest request);
    void deleteAccount();   // ✅ NEW
    PagedResponse<UserResponse> getAllUsers(int page, int size, String search);
    PagedResponse<UserResponse> getUsersByRole(String role, int page, int size);
    void toggleUserStatus(Long id);
    void deleteUser(Long id);
}