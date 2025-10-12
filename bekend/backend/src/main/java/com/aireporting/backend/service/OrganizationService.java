package com.aireporting.backend.service;

import com.aireporting.backend.dto.UserDTO; // UserDTO'yu import et
import com.aireporting.backend.entity.User;
import com.aireporting.backend.repository.OrganizationRepository;
import com.aireporting.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors; // Collectors'ı import et

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    /**
     * Belirtilen organizasyon ID'sine sahip tüm kullanıcıları DTO olarak getirir.
     * @param organizationId Üyeleri listelenecek organizasyonun ID'si.
     * @return UserDTO listesi.
     */
    public List<UserDTO> getOrganizationMembers(Long organizationId) {
        // Veritabanından User listesini çek
        List<User> users = userRepository.findAllByOrganizationId(organizationId);
        // Her bir User nesnesini UserDTO'ya dönüştür ve liste olarak döndür
        return users.stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Bir kullanıcıyı bir organizasyona davet eder.
     */
    @Transactional
    public User inviteUser(User currentUser, String emailToInvite, String role) {
        if (!currentUser.getOrganization().getOwner().getId().equals(currentUser.getId())) {
            throw new SecurityException("Sadece organizasyon sahibi yeni üye davet edebilir.");
        }

        return userRepository.findByEmail(emailToInvite)
                .map(existingUser -> {
                    if (existingUser.getOrganization() != null) {
                        throw new IllegalArgumentException("Bu kullanıcı zaten başka bir organizasyona üye.");
                    }
                    existingUser.setOrganization(currentUser.getOrganization());
                    existingUser.setRole(role);
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    String randomPassword = UUID.randomUUID().toString().substring(0, 8);
                    User newUser = User.builder()
                            .email(emailToInvite)
                            .password(passwordEncoder.encode(randomPassword))
                            .firstName("Davetli")
                            .lastName("Kullanıcı")
                            .role(role)
                            .isActive(true)
                            .credits(0)
                            .organization(currentUser.getOrganization())
                            .build();
                    return userRepository.save(newUser);
                });
    }

    /**
     * Bir kullanıcıyı organizasyondan çıkarır.
     */
    public void removeUser(User currentUser, Long memberId) {
        if (!currentUser.getOrganization().getOwner().getId().equals(currentUser.getId())) {
            throw new SecurityException("Sadece organizasyon sahibi üye çıkarabilir.");
        }

        if (currentUser.getId().equals(memberId)) {
            throw new IllegalArgumentException("Organizasyon sahibi kendisini organizasyondan çıkaramaz.");
        }

        User userToRemove = userRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Çıkarılacak kullanıcı bulunamadı."));

        if (userToRemove.getOrganization() == null || !userToRemove.getOrganization().getId().equals(currentUser.getOrganization().getId())) {
            throw new IllegalArgumentException("Bu kullanıcı sizin organizasyonunuzda değil.");
        }

        userToRemove.setOrganization(null);
        userRepository.save(userToRemove);
    }
}