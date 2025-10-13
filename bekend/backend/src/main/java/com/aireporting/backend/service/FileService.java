package com.aireporting.backend.service;

import com.aireporting.backend.dto.FileResponseDTO;
import com.aireporting.backend.entity.Organization;
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
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // DÜZELTME: Constructor injection kullanıyoruz.
public class FileService {

    private final UploadedFileRepository uploadedFileRepository;
    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    public List<FileResponseDTO> getFilesForOrganization(Organization organization) {
        List<UploadedFile> files = uploadedFileRepository.findByOrganizationOrderByUploadedAtDesc(organization);
        return files.stream()
                .map(FileResponseDTO::new)
                .collect(Collectors.toList());
    }

    public UploadedFile uploadFile(User user, MultipartFile file) throws IOException {
        String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(uniqueFileName)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        UploadedFile uploadedFile = UploadedFile.builder()
                .organization(user.getOrganization())
                .uploadedBy(user)
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .storagePath(uniqueFileName)
                .build();

        return uploadedFileRepository.save(uploadedFile);
    }

    public boolean deleteFile(User user, Long fileId) {
        UploadedFile file = uploadedFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Dosya bulunamadı!"));

        if (!file.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new SecurityException("Bu dosyayı silmeye yetkiniz yok!");
        }

        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(file.getStoragePath())
                .build();

        s3Client.deleteObject(deleteObjectRequest);
        uploadedFileRepository.delete(file);
        return true;
    }

    public ResponseEntity<Resource> downloadFile(User user, Long fileId) {
        UploadedFile file = uploadedFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Dosya bulunamadı!"));

        if (!file.getOrganization().getId().equals(user.getOrganization().getId())) {
            throw new SecurityException("Bu dosyayı indirmeye yetkiniz yok!");
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

    public byte[] downloadFileContent(String storagePath) throws IOException {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(storagePath)
                .build();
        ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(getObjectRequest);
        return objectBytes.asByteArray();
    }
}