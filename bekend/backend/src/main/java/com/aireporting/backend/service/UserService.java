package com.aireporting.backend.service;

import com.aireporting.backend.dto.RegisterRequest;
import com.aireporting.backend.entity.Organization;
import com.aireporting.backend.entity.User;
import com.aireporting.backend.repository.OrganizationRepository;
import com.aireporting.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    // HATA DÜZELTİLDİ: Artık yeni bir nesne oluşturmuyoruz, Spring'in merkezi bean'ini kullanıyoruz.
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered!");
        }

        Organization newOrganization = Organization.builder()
                .name(request.getFirstName() + "'s Organization")
                .build();
        Organization savedOrganization = organizationRepository.save(newOrganization);

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // Merkezi şifreleyici kullanılıyor.
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role("USER")
                .isActive(true)
                .credits(100)
                .organization(savedOrganization)
                .build();
        User savedUser = userRepository.save(user);

        savedOrganization.setOwner(savedUser);
        organizationRepository.save(savedOrganization);

        return savedUser;
    }

    public User registerAdmin(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered!");
        }
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // Merkezi şifreleyici kullanılıyor.
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role("ADMIN")
                .isActive(true)
                .build();
        return userRepository.save(user);
    }
}