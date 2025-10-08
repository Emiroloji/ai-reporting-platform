package com.aireporting.backend.controller;

import com.aireporting.backend.service.FilePreviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FilePreviewController {

    private final FilePreviewService filePreviewService;

    @GetMapping("/{fileId}/preview")
    public ResponseEntity<?> getFilePreview(
            Authentication authentication,
            @PathVariable Long fileId
    ) {
        // (İstersen user yetki kontrolü ekle)
        try {
            return ResponseEntity.ok(filePreviewService.getFilePreview(fileId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}