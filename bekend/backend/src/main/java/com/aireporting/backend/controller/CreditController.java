package com.aireporting.backend.controller;

import com.aireporting.backend.entity.CreditTransaction;
import com.aireporting.backend.entity.User;
import com.aireporting.backend.repository.CreditTransactionRepository;
import com.aireporting.backend.repository.UserRepository;
import com.aireporting.backend.service.CreditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/credits")
@RequiredArgsConstructor
public class CreditController {
    private final UserRepository userRepository;
    private final CreditTransactionRepository creditTransactionRepository;
    private final CreditService creditService;


    @GetMapping("/history")
    public ResponseEntity<List<CreditTransaction>> getCreditHistory(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<CreditTransaction> history = creditTransactionRepository.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addCredits(Authentication authentication, @RequestBody Map<String, Integer> credits) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Integer amount = credits.get("amount");
        if (amount == null || amount <= 0) {
            return ResponseEntity.badRequest().body("Kredi miktarı pozitif olmalı");
        }

        user.setCredits(user.getCredits() + amount);
        userRepository.save(user);

        creditTransactionRepository.save(CreditTransaction.builder()
                .user(user)
                .transactionType("LOAD")
                .amount(amount)
                .description("Kullanıcı kendi hesabına kredi ekledi")
                .build());

        return ResponseEntity.ok("Kredi başarıyla eklendi. Yeni kredi miktarı: " + user.getCredits());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/add")
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

        creditTransactionRepository.save(CreditTransaction.builder()
                .user(user)
                .transactionType("ADMIN_LOAD")
                .amount(amount)
                .description("Admin tarafından kredi yüklendi")
                .build());

        return ResponseEntity.ok("Kullanıcıya kredi başarıyla eklendi. Yeni kredi miktarı: " + user.getCredits());
    }

    // Kredi harcama endpointi
    @PostMapping("/use")
    public ResponseEntity<?> useCredits(Authentication authentication, @RequestBody Map<String, Object> request) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Integer amount = (Integer) request.get("amount");
        String description = (String) request.getOrDefault("description", "Kredi harcandı");

        try {
            creditService.useCredits(user, amount ,description);
            return ResponseEntity.ok("Kredi başarıyla harcandı. Kalan kredi: " + user.getCredits());
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}