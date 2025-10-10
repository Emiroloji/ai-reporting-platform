package com.aireporting.backend.service;

import com.aireporting.backend.entity.UploadedFile;
import com.aireporting.backend.entity.User;
import com.aireporting.backend.repository.UploadedFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileService {

    private final UploadedFileRepository uploadedFileRepository;
    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    /**
     * Dosyayı S3'e yükler ve veritabanına kaydeder.
     * Dosya, yükleyen kullanıcının organizasyonuna bağlanır.
     */
    public UploadedFile uploadFile(User user, MultipartFile file) throws IOException {
        String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(uniqueFileName)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        UploadedFile uploadedFile = UploadedFile.builder()
                .organization(user.getOrganization()) // Dosyayı kullanıcının organizasyonuna bağla
                .uploadedBy(user) // Dosyayı kimin yüklediğini belirt
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .storagePath(uniqueFileName)
                .build();

        return uploadedFileRepository.save(uploadedFile);
    }

    /**
     * Bir dosyayı siler.
     * Şimdilik sadece dosyayı yükleyen kişi kendi dosyasını silebilir.
     * TODO: Gelecekte organizasyon yöneticilerinin de silmesine izin verilecek şekilde güncellenmeli.
     */
    public boolean deleteFile(User user, Long fileId) {
        UploadedFile file = uploadedFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Dosya bulunamadı!"));

        // Yetki Kontrolü: Kullanıcı, dosyanın ait olduğu organizasyonda mı?
        if (!file.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new RuntimeException("Bu dosyayı silmeye yetkiniz yok!");
        }

        // Daha katı bir kural: Sadece yükleyen kişi veya organizasyon sahibi silebilir.
        // if (!file.getUploadedBy().getId().equals(user.getId()) && !file.getOrganization().getOwner().getId().equals(user.getId())) {
        //     throw new RuntimeException("Bu dosyayı silmeye yetkiniz yok!");
        // }


        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(file.getStoragePath())
                .build();

        s3Client.deleteObject(deleteObjectRequest);
        uploadedFileRepository.delete(file);
        return true;
    }

    /**
     * Bir dosyayı indirir.
     * Şimdilik sadece dosyanın ait olduğu organizasyondaki bir üye indirebilir.
     */
    public ResponseEntity<Resource> downloadFile(User user, Long fileId) {
        UploadedFile file = uploadedFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Dosya bulunamadı!"));

        // Yetki Kontrolü: Kullanıcı, dosyanın ait olduğu organizasyonda mı?
        if (!file.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new RuntimeException("Bu dosyayı indirmeye yetkiniz yok!");
        }

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(file.getStoragePath())
                .build();

        InputStreamResource resource = new InputStreamResource(s3Client.getObject(getObjectRequest));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(file.getFileType()))
                .contentLength(file.getFileSize())
                .body(resource);
    }
}