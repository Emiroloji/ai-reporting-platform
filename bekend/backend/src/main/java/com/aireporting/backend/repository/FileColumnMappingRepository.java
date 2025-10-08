package com.aireporting.backend.repository;

import com.aireporting.backend.entity.FileColumnMapping;
import com.aireporting.backend.entity.UploadedFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileColumnMappingRepository extends JpaRepository<FileColumnMapping, Long> {
    List<FileColumnMapping> findByFile(UploadedFile file);
    void deleteByFile(UploadedFile file);
}