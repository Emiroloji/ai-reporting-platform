package com.aireporting.backend.controller;

import com.aireporting.backend.entity.FileColumnMapping;
import com.aireporting.backend.service.FileColumnMappingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files/{fileId}/mapping")
@RequiredArgsConstructor
public class FileColumnMappingController {

    private final FileColumnMappingService mappingService;

    // Mappingleri getir
    @GetMapping
    public ResponseEntity<List<FileColumnMapping>> getMappings(
            Authentication authentication,
            @PathVariable Long fileId
    ) {
        // (İstersen kullanıcı yetki kontrolü ekleyebilirsin)
        return ResponseEntity.ok(mappingService.getMappingsByFileId(fileId));
    }

    // Mapping ekle
    @PostMapping
    public ResponseEntity<FileColumnMapping> addMapping(
            Authentication authentication,
            @PathVariable Long fileId,
            @RequestBody Map<String, String> body
    ) {
        String sourceColumn = body.get("sourceColumn");
        String targetField = body.get("targetField");
        FileColumnMapping mapping = mappingService.addMapping(fileId, sourceColumn, targetField);
        return ResponseEntity.ok(mapping);
    }

    // Mapping güncelle
    @PutMapping("/{mappingId}")
    public ResponseEntity<?> updateMapping(
            Authentication authentication,
            @PathVariable Long fileId,
            @PathVariable Long mappingId,
            @RequestBody Map<String, String> body
    ) {
        String targetField = body.get("targetField");
        mappingService.updateMapping(mappingId, targetField);
        return ResponseEntity.ok().build();
    }

    // Dosyadaki tüm mappingleri sil
    @DeleteMapping
    public ResponseEntity<?> deleteAllMappings(
            Authentication authentication,
            @PathVariable Long fileId
    ) {
        mappingService.deleteMappingsByFileId(fileId);
        return ResponseEntity.ok().build();
    }


}