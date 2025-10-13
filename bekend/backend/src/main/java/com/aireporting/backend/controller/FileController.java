package com.aireporting.backend.controller;

import com.aireporting.backend.dto.FileResponseDTO;
import com.aireporting.backend.entity.UploadedFile;
import com.aireporting.backend.entity.User;
import com.aireporting.backend.repository.UserRepository;
import com.aireporting.backend.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map; // HATA DÜZELTMESİ: Eksik olan import ifadesi eklendi.

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;
    private final UserRepository userRepository;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            UploadedFile uploaded = fileService.uploadFile(user, file);
            return ResponseEntity.ok(new FileResponseDTO(uploaded));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Dosya yüklenemedi: " + e.getMessage());
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<FileResponseDTO>> listMyFiles(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String email = userDetails.getUsername();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<FileResponseDTO> fileDTOs = fileService.getFilesForOrganization(user.getOrganization());
        return ResponseEntity.ok(fileDTOs);
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<?> deleteFile(
            Authentication authentication,
            @PathVariable Long fileId) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            fileService.deleteFile(user, fileId);
            return ResponseEntity.ok(Map.of("message", "Dosya başarıyla silindi."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Dosya silinemedi: " + e.getMessage()));
        }
    }

    @GetMapping("/download/{fileId}")
    public ResponseEntity<Resource> downloadFile(
            Authentication authentication,
            @PathVariable Long fileId) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            return fileService.downloadFile(user, fileId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}