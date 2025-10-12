package com.aireporting.backend.service;

import com.aireporting.backend.dto.UserDTO;
import com.aireporting.backend.entity.User;
import com.aireporting.backend.repository.OrganizationRepository;
import com.aireporting.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailService emailService; // Yeni servisi inject ediyoruz

    public List<UserDTO> getOrganizationMembers(Long organizationId) {
        List<User> users = userRepository.findAllByOrganizationId(organizationId);
        return users.stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }

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
                    // TODO: Mevcut kullanıcıya, organizasyona eklendiğine dair bir bildirim maili gönderilebilir.
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    String randomPassword = UUID.randomUUID().toString().substring(0, 8);
                    User newUser = User.builder()
                            .email(emailToInvite)
                            .password(passwordEncoder.encode(randomPassword)) // Şifreyi şifreleyip kaydediyoruz
                            .firstName("Davetli")
                            .lastName("Kullanıcı")
                            .role(role)
                            .isActive(true)
                            .credits(0)
                            .organization(currentUser.getOrganization())
                            .build();

                    // E-POSTA GÖNDERME ADIMI
                    emailService.sendTemporaryPasswordEmail(emailToInvite, randomPassword);

                    return userRepository.save(newUser);
                });
    }

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