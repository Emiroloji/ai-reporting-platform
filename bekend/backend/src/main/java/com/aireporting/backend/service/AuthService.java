package com.aireporting.backend.service;

import com.aireporting.backend.dto.LoginRequest;
import com.aireporting.backend.dto.LoginResponse;
import com.aireporting.backend.dto.RefreshTokenRequest;
import com.aireporting.backend.dto.RefreshTokenResponse;
import com.aireporting.backend.entity.User;
import com.aireporting.backend.repository.UserRepository;
import com.aireporting.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        String accessToken = jwtUtil.generateAccessToken(user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        return new LoginResponse(accessToken, refreshToken);
    }


    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }
        String email = jwtUtil.getEmailFromJwt(refreshToken);
        String newAccessToken = jwtUtil.generateAccessToken(email);
        return new RefreshTokenResponse(newAccessToken);
    }
}