package com.aireporting.backend.service;

import com.aireporting.backend.entity.FileColumnMapping;
import com.aireporting.backend.entity.UploadedFile;
import com.aireporting.backend.repository.FileColumnMappingRepository;
import com.aireporting.backend.repository.UploadedFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FileColumnMappingService {

    private final FileColumnMappingRepository mappingRepository;
    private final UploadedFileRepository fileRepository;

    public List<FileColumnMapping> getMappingsByFileId(Long fileId) {
        UploadedFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Dosya bulunamadı!"));
        return mappingRepository.findByFile(file);
    }

    public FileColumnMapping addMapping(Long fileId, String sourceColumn, String targetField) {
        UploadedFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Dosya bulunamadı!"));
        FileColumnMapping mapping = FileColumnMapping.builder()
                .file(file)
                .sourceColumn(sourceColumn)
                .targetField(targetField)
                .build();
        return mappingRepository.save(mapping);
    }

    public void updateMapping(Long mappingId, String targetField) {
        Optional<FileColumnMapping> mappingOpt = mappingRepository.findById(mappingId);
        if (mappingOpt.isPresent()) {
            FileColumnMapping mapping = mappingOpt.get();
            mapping.setTargetField(targetField);
            mappingRepository.save(mapping);
        } else {
            throw new RuntimeException("Mapping bulunamadı!");
        }
    }


    @Transactional
    public void deleteMappingsByFileId(Long fileId) {
        UploadedFile file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Dosya bulunamadı!"));
        mappingRepository.deleteByFile(file);
    }
}