package com.aireporting.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "file_column_mapping")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileColumnMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id", nullable = false)
    private UploadedFile file;

    // Dosyadaki kolon adı
    @Column(nullable = false)
    private String sourceColumn;

    // Eşlenen hedef alan (sistemdeki veya AI için)
    @Column(nullable = false)
    private String targetField;
}