package com.aireporting.backend.controller;

import com.aireporting.backend.entity.User;
import com.aireporting.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final UserRepository userRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createReport(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getCredits() == null || user.getCredits() < 1) {
            return ResponseEntity.badRequest().body("Yetersiz kredi! Lütfen kredi yükleyin.");
        }

        // 1 kredi düş
        user.setCredits(user.getCredits() - 1);
        userRepository.save(user);

        // Basit bir mesaj dön (ileride rapor, dosya vs. dönebiliriz)
        return ResponseEntity.ok("Rapor başarıyla oluşturuldu. Kalan kredi: " + user.getCredits());
    }
}