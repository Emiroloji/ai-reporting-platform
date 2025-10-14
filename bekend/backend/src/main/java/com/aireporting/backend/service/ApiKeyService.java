package com.aireporting.backend.service;

import com.aireporting.backend.entity.Organization;
import com.aireporting.backend.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApiKeyService {

    private final OrganizationRepository organizationRepository;

    public Optional<Organization> findByApiKey(String apiKey) {
        return organizationRepository.findByApiKey(apiKey);
    }

    @Transactional
    public String regenerateApiKey(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organizasyon bulunamadı."));

        String newApiKey = UUID.randomUUID().toString();
        organization.setApiKey(newApiKey);
        organizationRepository.save(organization);
        return newApiKey;
    }
}