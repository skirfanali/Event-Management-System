package com.eventhub.service.impl;

import com.eventhub.dto.request.ChangePasswordRequest;
import com.eventhub.dto.request.UpdateProfileRequest;
import com.eventhub.dto.response.PagedResponse;
import com.eventhub.dto.response.UserResponse;
import com.eventhub.entity.User;
import com.eventhub.enums.Role;
import com.eventhub.exception.*;
import com.eventhub.repository.UserRepository;
import com.eventhub.service.CloudinaryService;
import com.eventhub.service.UserService;
import com.eventhub.util.PageUtil;
import com.eventhub.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository    userRepository;
    private final CloudinaryService cloudinaryService;
    private final SecurityUtil      securityUtil;
    private final ModelMapper       modelMapper;
    private final PasswordEncoder   passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        return modelMapper.map(
            userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id)),
            UserResponse.class);
    }

    @Override
    public UserResponse updateProfile(UpdateProfileRequest request) {
        User user = securityUtil.getCurrentUser();
        // Common fields
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setBio(request.getBio());
        // Student fields
        user.setCollege(request.getCollege());
        user.setBranch(request.getBranch());
        user.setYear(request.getYear());
        // ✅ FIX: Save organizer-specific fields to DB
        user.setOrganization(request.getOrganization());
        user.setDesignation(request.getDesignation());
        user.setWebsite(request.getWebsite());
        return modelMapper.map(userRepository.save(user), UserResponse.class);
    }

    @Override
    public String uploadAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new BadRequestException("File is required");
        User user = securityUtil.getCurrentUser();
        if (user.getAvatarPublicId() != null) {
            cloudinaryService.deleteImage(user.getAvatarPublicId());
        }
        Map<String, String> result = cloudinaryService.uploadImage(file, "avatars");
        user.setAvatarUrl(result.get("url"));
        user.setAvatarPublicId(result.get("publicId"));
        userRepository.save(user);
        return result.get("url");
    }

    @Override
    public void changePassword(ChangePasswordRequest request) {
        User user = securityUtil.getCurrentUser();
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public void deleteAccount() {
        userRepository.delete(securityUtil.getCurrentUser());
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getAllUsers(int page, int size, String search) {
        Pageable pageable = PageUtil.createPageable(page, size, "createdAt", "desc");
        Page<User> users = (search != null && !search.isBlank())
            ? userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search, pageable)
            : userRepository.findAll(pageable);
        return PageUtil.toPagedResponse(users.map(u -> modelMapper.map(u, UserResponse.class)));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getUsersByRole(String role, int page, int size) {
        Pageable pageable = PageUtil.createPageable(page, size, "createdAt", "desc");
        return PageUtil.toPagedResponse(
            userRepository.findByRole(Role.valueOf(role.toUpperCase()), pageable)
                .map(u -> modelMapper.map(u, UserResponse.class)));
    }

    @Override
    public void toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) throw new ResourceNotFoundException("User", id);
        userRepository.deleteById(id);
    }
}