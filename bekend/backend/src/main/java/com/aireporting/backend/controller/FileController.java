package com.aireporting.backend.controller;

import com.aireporting.backend.entity.UploadedFile;
import com.aireporting.backend.entity.User;
import com.aireporting.backend.repository.UploadedFileRepository;
import com.aireporting.backend.repository.UserRepository;
import com.aireporting.backend.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import com.aireporting.backend.dto.FileResponseDTO; // Yeni DTO'muzu import ediyoruz
import java.util.List;
import java.util.stream.Collectors; // Stream API için import


import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {
    private final FileService fileService;
    private final UserRepository userRepository;
    private final UploadedFileRepository uploadedFileRepository;

    // Dosya yükleme endpointi
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            UploadedFile uploaded = fileService.uploadFile(user, file);
            return ResponseEntity.ok(uploaded);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Dosya yüklenemedi: " + e.getMessage());
        }
    }



    // Kendi yüklediği dosyaları değil, organizasyonun dosyalarını listele
    @GetMapping("/my")
    public ResponseEntity<List<FileResponseDTO>> listMyFiles(Authentication authentication) {
        // Principal'ı (kimliği doğrulanmış kullanıcı nesnesi) alıyoruz.
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        // UserDetails'den kullanıcı adını (bizim durumumuzda e-posta) alıyoruz.
        String email = userDetails.getUsername();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // ... (metodun geri kalanı aynı)
        List<UploadedFile> files = uploadedFileRepository.findByOrganizationOrderByUploadedAtDesc(user.getOrganization());
        List<FileResponseDTO> fileDTOs = files.stream()
                .map(FileResponseDTO::new)
                .collect(Collectors.toList());
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
            boolean deleted = fileService.deleteFile(user, fileId);
            if (deleted) {
                return ResponseEntity.ok("Dosya başarıyla silindi.");
            } else {
                return ResponseEntity.ok("Dosya veritabanından silindi ama fiziksel dosya bulunamadı.");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Dosya silinemedi: " + e.getMessage());
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