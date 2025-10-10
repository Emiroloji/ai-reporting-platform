// src/main/java/com/aireporting/backend/dto/AiResultDTO.java

package com.aireporting.backend.dto;

import com.aireporting.backend.entity.AiResult;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AiResultDTO {

    private Long id;
    private String resultType;
    private String resultData; // JSON verisini String olarak alacağız
    private LocalDateTime createdAt;

    public AiResultDTO(AiResult result) {
        this.id = result.getId();
        this.resultType = result.getResultType();
        this.resultData = result.getResultData();
        this.createdAt = result.getCreatedAt();
    }
}