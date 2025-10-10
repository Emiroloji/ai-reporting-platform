// src/main/java/com/aireporting/backend/dto/AiRequestDTO.java

package com.aireporting.backend.dto;

import com.aireporting.backend.entity.AiRequest;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AiRequestDTO {
    private Long id;
    private String fileName;
    private String status;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    public AiRequestDTO(AiRequest request) {
        this.id = request.getId();
        this.fileName = request.getFile().getFileName();
        this.status = request.getStatus();
        this.errorMessage = request.getErrorMessage();
        this.createdAt = request.getCreatedAt();
        this.completedAt = request.getCompletedAt();
    }
}