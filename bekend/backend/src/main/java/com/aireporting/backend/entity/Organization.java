package com.aireporting.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "organizations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // YENİ EKLENDİ: API anahtarı için sütun
    @Column(name = "api_key", unique = true)
    private String apiKey;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToOne
    @JoinColumn(name = "owner_id", referencedColumnName = "id")
    private User owner;

    // YENİ EKLENDİ: API anahtarı oluşturmak için yardımcı metot
    @PrePersist
    protected void onCreate() {
        if (this.apiKey == null) {
            this.apiKey = UUID.randomUUID().toString();
        }
    }
}