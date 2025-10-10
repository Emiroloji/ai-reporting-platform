package com.aireporting.backend.service;

import com.aireporting.backend.dto.RegisterRequest;
import com.aireporting.backend.entity.Organization;
import com.aireporting.backend.entity.User;
import com.aireporting.backend.repository.OrganizationRepository; // Yeni ekledik
import com.aireporting.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Yeni ekledik

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository; // Yeni ekledik
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional // Bu annotation önemli!
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered!");
        }

        // 1. Yeni bir Organizasyon oluştur
        Organization newOrganization = Organization.builder()
                .name(request.getFirstName() + "'s Organization") // Örn: "Emir's Organization"
                .build();

        // Organization'ı veritabanına kaydet
        Organization savedOrganization = organizationRepository.save(newOrganization);

        // 2. Yeni Kullanıcıyı bu organizasyona bağlı olarak oluştur
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role("USER") // Veya "ADMIN" de olabilir, "OWNER" gibi yeni bir rol de tanımlayabiliriz.
                .isActive(true)
                .credits(100)
                .organization(savedOrganization) // Kullanıcıyı organizasyona bağla
                .build();

        User savedUser = userRepository.save(user);

        // 3. Organizasyonun sahibini güncelle
        // Bu adım önemli çünkü organizasyonu oluştururken henüz user ID'si yoktu.
        savedOrganization.setOwner(savedUser);
        organizationRepository.save(savedOrganization);

        return savedUser;
    }

    // registerAdmin metodu şimdilik aynı kalabilir veya benzer şekilde güncellenebilir.
    public User registerAdmin(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered!");
        }
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role("ADMIN")
                .isActive(true)
                .build();
        return userRepository.save(user);
    }
}