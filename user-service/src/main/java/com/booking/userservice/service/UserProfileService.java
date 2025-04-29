package com.booking.userservice.service;

import com.booking.userservice.dto.UserProfileDTO;
import com.booking.userservice.exception.ResourceNotFoundException;
import com.booking.userservice.exception.UserAlreadyExistsException;
import com.booking.userservice.model.UserProfile;
import com.booking.userservice.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;

    @Transactional(readOnly = true)
    public List<UserProfileDTO> getAllUserProfiles() {
        return userProfileRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserProfileDTO getUserProfileById(Long id) {
        UserProfile userProfile = userProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found with id: " + id));
        
        return convertToDTO(userProfile);
    }

    @Transactional(readOnly = true)
    public UserProfileDTO getUserProfileByUserId(String userId) {
        UserProfile userProfile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found with userId: " + userId));
        
        return convertToDTO(userProfile);
    }

    @Transactional
    public UserProfileDTO createUserProfile(UserProfileDTO userProfileDTO) {
        if (userProfileRepository.existsByUserId(userProfileDTO.getUserId())) {
            throw new UserAlreadyExistsException("User profile already exists with userId: " + userProfileDTO.getUserId());
        }
        
        if (userProfileRepository.existsByEmail(userProfileDTO.getEmail())) {
            throw new UserAlreadyExistsException("User profile already exists with email: " + userProfileDTO.getEmail());
        }
        
        UserProfile userProfile = convertToEntity(userProfileDTO);
        UserProfile savedUserProfile = userProfileRepository.save(userProfile);
        
        return convertToDTO(savedUserProfile);
    }

    @Transactional
    public UserProfileDTO updateUserProfile(String userId, UserProfileDTO userProfileDTO) {
        UserProfile existingUserProfile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found with userId: " + userId));
        
        // Update fields
        existingUserProfile.setFullName(userProfileDTO.getFullName());
        existingUserProfile.setCurrency(userProfileDTO.getCurrency());
        existingUserProfile.setMonthlyIncome(userProfileDTO.getMonthlyIncome());
        existingUserProfile.setPreferredLanguage(userProfileDTO.getPreferredLanguage());
        existingUserProfile.setTimezone(userProfileDTO.getTimezone());
        existingUserProfile.setProfilePictureUrl(userProfileDTO.getProfilePictureUrl());
        
        // Optional: update email if it changed and doesn't conflict
        if (!existingUserProfile.getEmail().equals(userProfileDTO.getEmail())) {
            if (userProfileRepository.existsByEmail(userProfileDTO.getEmail())) {
                throw new UserAlreadyExistsException("Email already in use: " + userProfileDTO.getEmail());
            }
            existingUserProfile.setEmail(userProfileDTO.getEmail());
        }
        
        UserProfile updatedUserProfile = userProfileRepository.save(existingUserProfile);
        
        return convertToDTO(updatedUserProfile);
    }

    @Transactional
    public void deleteUserProfile(Long id) {
        if (!userProfileRepository.existsById(id)) {
            throw new ResourceNotFoundException("User profile not found with id: " + id);
        }
        
        userProfileRepository.deleteById(id);
    }
    
    // Helper methods to convert between Entity and DTO
    private UserProfileDTO convertToDTO(UserProfile userProfile) {
        return UserProfileDTO.builder()
                .id(userProfile.getId())
                .userId(userProfile.getUserId())
                .fullName(userProfile.getFullName())
                .email(userProfile.getEmail())
                .currency(userProfile.getCurrency())
                .monthlyIncome(userProfile.getMonthlyIncome())
                .preferredLanguage(userProfile.getPreferredLanguage())
                .timezone(userProfile.getTimezone())
                .profilePictureUrl(userProfile.getProfilePictureUrl())
                .build();
    }
    
    private UserProfile convertToEntity(UserProfileDTO userProfileDTO) {
        return UserProfile.builder()
                .userId(userProfileDTO.getUserId())
                .fullName(userProfileDTO.getFullName())
                .email(userProfileDTO.getEmail())
                .currency(userProfileDTO.getCurrency())
                .monthlyIncome(userProfileDTO.getMonthlyIncome())
                .preferredLanguage(userProfileDTO.getPreferredLanguage())
                .timezone(userProfileDTO.getTimezone())
                .profilePictureUrl(userProfileDTO.getProfilePictureUrl())
                .build();
    }
}
