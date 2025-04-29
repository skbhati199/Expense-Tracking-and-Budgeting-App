package com.booking.authservice.security.oauth2;

import com.booking.authservice.model.Role;
import com.booking.authservice.model.User;
import com.booking.authservice.repository.UserRepository;
import com.booking.authservice.security.jwt.JwtUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws ServletException, IOException {
        
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        DefaultOAuth2User oAuth2User = (DefaultOAuth2User) authentication.getPrincipal();
        
        Map<String, Object> attributes = oAuth2User.getAttributes();
        
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String googleId = (String) attributes.get("sub"); // Google's unique identifier
        
        // Check if user exists
        Optional<User> userOptional = userRepository.findByGoogleId(googleId);
        User user;
        
        if (userOptional.isEmpty()) {
            // Create new user if not exists
            user = User.builder()
                    .username(email.split("@")[0]) // Generate username from email
                    .email(email)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Random password
                    .googleId(googleId)
                    .roles(Collections.singleton(Role.USER))
                    .build();
            
            userRepository.save(user);
        } else {
            user = userOptional.get();
        }
        
        // Generate JWT token
        String token = jwtUtils.generateTokenFromUsername(user.getUsername());
        
        // Redirect to frontend with token
        // In a real application, this would redirect to your frontend application
        // with the token as a query parameter or in a cookie
        response.sendRedirect("http://localhost:4200/oauth2/redirect?token=" + token);
    }
}
