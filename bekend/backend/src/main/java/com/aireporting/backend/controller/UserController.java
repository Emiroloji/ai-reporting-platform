package com.aireporting.backend.controller;

import com.aireporting.backend.entity.User;
import com.aireporting.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    // Profil görüntüleme (zaten yaptık)
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    // Profil güncelleme
    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(Authentication authentication, @RequestBody User updatedUser) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setFirstName(updatedUser.getFirstName());
        user.setLastName(updatedUser.getLastName());
        // Email güncellemesi istenirse:
        // user.setEmail(updatedUser.getEmail());
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/add-credits")
    public ResponseEntity<?> addCredits(Authentication authentication, @RequestBody Map<String, Integer> credits) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Integer amount = credits.get("amount");
        if (amount == null || amount <= 0) {
            return ResponseEntity.badRequest().body("kredi miktarı pozitif olmalı");

        }
        user.setCredits(user.getCredits() + amount);
        userRepository.save(user);
        return ResponseEntity.ok("Kredi başarıyla eklendi. Yeni kredi miktarı: " + user.getCredits());
    }

    @PreAuthorize("hasRole('ADMIN')") // Sadece ADMIN rolündeki kullanıcılar erişebilir
    @PostMapping("/admin/add-credits")
    public ResponseEntity<?> adminAddCredits(@RequestBody Map<String, Object> request) {
        String email = (String) request.get("email");
        Integer amount = (Integer) request.get("amount");
        if (email == null || amount == null || amount <= 0) {
            return ResponseEntity.badRequest().body("Geçersiz istek");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setCredits(user.getCredits() + amount);
        userRepository.save(user);
        return ResponseEntity.ok("Kullanıcıya kredi başarıyla eklendi. Yeni kredi miktarı: " + user.getCredits());
    }
}