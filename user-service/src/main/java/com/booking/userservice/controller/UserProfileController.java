package com.booking.userservice.controller;

import com.booking.userservice.dto.UserProfileDTO;
import com.booking.userservice.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping
    public ResponseEntity<List<UserProfileDTO>> getAllUserProfiles() {
        return ResponseEntity.ok(userProfileService.getAllUserProfiles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDTO> getUserProfileById(@PathVariable Long id) {
        return ResponseEntity.ok(userProfileService.getUserProfileById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<UserProfileDTO> getUserProfileByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(userProfileService.getUserProfileByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<UserProfileDTO> createUserProfile(@Valid @RequestBody UserProfileDTO userProfileDTO) {
        UserProfileDTO createdProfile = userProfileService.createUserProfile(userProfileDTO);
        return new ResponseEntity<>(createdProfile, HttpStatus.CREATED);
    }

    @PutMapping("/user/{userId}")
    public ResponseEntity<UserProfileDTO> updateUserProfile(
            @PathVariable String userId,
            @Valid @RequestBody UserProfileDTO userProfileDTO) {
        return ResponseEntity.ok(userProfileService.updateUserProfile(userId, userProfileDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserProfile(@PathVariable Long id) {
        userProfileService.deleteUserProfile(id);
        return ResponseEntity.noContent().build();
    }
}
