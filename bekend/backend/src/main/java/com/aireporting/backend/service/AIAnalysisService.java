package com.aireporting.backend.service;

import com.aireporting.backend.entity.FileColumnMapping;
import com.aireporting.backend.entity.UploadedFile;
import com.aireporting.backend.repository.FileColumnMappingRepository;
import com.aireporting.backend.repository.UploadedFileRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIAnalysisService {

    private final UploadedFileRepository uploadedFileRepository;
    private final FileColumnMappingRepository fileColumnMappingRepository;

    public String sendFileToPythonAI(Long fileId) {
        UploadedFile file = uploadedFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        String filePath = file.getStoragePath();

        // Mappingleri çek
        List<FileColumnMapping> mappings = fileColumnMappingRepository.findByFile(file);
        Map<String, String> mappingJson = new HashMap<>();
        for (FileColumnMapping m : mappings) {
            mappingJson.put(m.getSourceColumn(), m.getTargetField());
        }
        String mappingJsonStr = "";
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            mappingJsonStr = objectMapper.writeValueAsString(mappingJson);
        } catch (Exception e) {
            throw new RuntimeException("Mapping JSON oluşturulamadı: " + e.getMessage());
        }

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(new File(filePath))); // Dosyanın local path'i
        body.add("mapping_json", mappingJsonStr); // Mapping JSON
        body.add("analysis_type", "basic"); // Analiz tipi

        RestTemplate restTemplate = new RestTemplate();
        String pythonApiUrl = "http://localhost:8000/analyze"; // DOĞRU ENDPOINT!
        ResponseEntity<String> response = restTemplate.postForEntity(pythonApiUrl, body, String.class);
        return response.getBody();
    }
}