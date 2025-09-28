package com.aireporting.backend.controller;

import com.aireporting.backend.dto.LoginRequest;
import com.aireporting.backend.dto.LoginResponse;
import com.aireporting.backend.dto.RegisterRequest;
import com.aireporting.backend.dto.RefreshTokenRequest;
import com.aireporting.backend.dto.RefreshTokenResponse;
import com.aireporting.backend.entity.User;
import com.aireporting.backend.service.AuthService;
import com.aireporting.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request) {
        User user = userService.register(request);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse tokens = authService.login(request);
        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<RefreshTokenResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        RefreshTokenResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }
}