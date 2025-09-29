package com.aireporting.backend.service;

import com.aireporting.backend.entity.UploadedFile;
import com.aireporting.backend.entity.User;
import com.aireporting.backend.repository.UploadedFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class FileService {
    private final UploadedFileRepository uploadedFileRepository;

    // Yükleme klasörü (proje kök dizininde 'uploads' klasörü olacak)
    private final String uploadDir = "uploads/";

    public UploadedFile uploadFile(User user, MultipartFile file) throws IOException {
        // 1) Proje kök dizinini belirle
        String rootPath = System.getProperty("user.dir"); // Her zaman uygulamanın ana dizini!
        String uploadDir = rootPath + File.separator + "uploads";

        // 2) uploads klasörü yoksa oluştur
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        // 3) Benzersiz dosya adı
        String uniqueName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        String filePath = uploadDir + File.separator + uniqueName;

        // 4) Dosyayı kaydet
        file.transferTo(new File(filePath));

        // 5) Veritabanına kaydet
        UploadedFile uploadedFile = UploadedFile.builder()
                .user(user)
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .storagePath(filePath)
                .build();

        return uploadedFileRepository.save(uploadedFile);
    }


    public boolean deleteFile(User user, Long fileId) {
        UploadedFile file = uploadedFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Dosya bulunamadı!"));

        // Sadece kendi dosyanı silebilirsin
        if (!file.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bu dosyayı silmeye yetkiniz yok!");
        }

        // Önce dosya sisteminden sil
        File physicalFile = new File(file.getStoragePath());
        boolean deleted = true;
        if (physicalFile.exists()) {
            deleted = physicalFile.delete();
        }

        // Veritabanından sil
        uploadedFileRepository.delete(file);

        return deleted;
    }

    public ResponseEntity<Resource> downloadFile(User user, Long fileId) {
        UploadedFile file = uploadedFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Dosya bulunamadı!"));

        // Sadece kendi dosyanı indirebilirsin
        if (!file.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bu dosyayı indirmeye yetkiniz yok!");
        }

        FileSystemResource resource = new FileSystemResource(file.getStoragePath());
        if (!resource.exists()) {
            throw new RuntimeException("Fiziksel dosya bulunamadı!");
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFileName() + "\"")
                .contentLength(file.getFileSize())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}