// src/main/java/com/aireporting/backend/dto/FileResponseDTO.java

package com.aireporting.backend.dto;

import com.aireporting.backend.entity.UploadedFile;
import lombok.Data;
import java.time.LocalDateTime;

@Data // Lombok ile getter/setter'ları otomatik oluştur
public class FileResponseDTO {

    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private LocalDateTime uploadedAt;

    // Bu constructor, bir UploadedFile entity'sini alıp DTO'ya çevirir.
    public FileResponseDTO(UploadedFile file) {
        this.id = file.getId();
        this.fileName = file.getFileName();
        this.fileType = file.getFileType();
        this.fileSize = file.getFileSize();
        this.uploadedAt = file.getUploadedAt();
    }
}