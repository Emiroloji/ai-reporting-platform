package com.aireporting.backend.controller;

import com.aireporting.backend.dto.UserDTO; // UserDTO'yu import et
import com.aireporting.backend.entity.User;
import com.aireporting.backend.repository.UserRepository;
import com.aireporting.backend.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/organization")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;
    private final UserRepository userRepository;

    /**
     * Mevcut kullanıcının organizasyonundaki tüm üyeleri listeler.
     */
    @GetMapping("/members")
    public ResponseEntity<List<UserDTO>> getOrganizationMembers(Authentication authentication) {
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        // Servisten artık UserDTO listesi geliyor
        List<UserDTO> members = organizationService.getOrganizationMembers(currentUser.getOrganization().getId());
        return ResponseEntity.ok(members);
    }

    /**
     * Organizasyona e-posta adresi ile yeni bir kullanıcı davet eder.
     */
    @PostMapping("/invite")
    public ResponseEntity<?> inviteUserToOrganization(Authentication authentication, @RequestBody Map<String, String> payload) {
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        String emailToInvite = payload.get("email");
        String role = payload.get("role");

        try {
            User invitedUser = organizationService.inviteUser(currentUser, emailToInvite, role);
            // Cevap olarak yeni oluşturulan kullanıcının DTO'sunu döndürelim
            return ResponseEntity.ok(UserDTO.fromEntity(invitedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Bir üyeyi organizasyondan çıkarır.
     */
    @DeleteMapping("/members/{memberId}")
    public ResponseEntity<?> removeUserFromOrganization(Authentication authentication, @PathVariable Long memberId) {
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        try {
            organizationService.removeUser(currentUser, memberId);
            return ResponseEntity.ok("Kullanıcı organizasyondan başarıyla çıkarıldı.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}