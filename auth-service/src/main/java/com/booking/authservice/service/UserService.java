package com.booking.authservice.service;

import com.booking.authservice.model.Role;
import com.booking.authservice.model.User;
import com.booking.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User createOAuth2User(String email, String googleId) {
        User user = User.builder()
                .username(email.split("@")[0]) // Generate username from email
                .email(email)
                .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Random password
                .googleId(googleId)
                .roles(Collections.singleton(Role.USER))
                .build();
        
        return userRepository.save(user);
    }
}
