// src/main/java/com/aireporting/backend/entity/AiResult.java

package com.aireporting.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private AiRequest request;

    @Column(name = "result_type")
    private String resultType;

    // PostgreSQL'deki JSONB tipini String olarak yönetmek için
    // Hibernate'e özel bir anotasyon kullanıyoruz.
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "result_data", columnDefinition = "jsonb")
    private String resultData;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}