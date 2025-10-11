// src/main/java/com/aireporting/backend/service/AIAnalysisService.java

package com.aireporting.backend.service;

import com.aireporting.backend.entity.FileColumnMapping;
import com.aireporting.backend.entity.UploadedFile;
import com.aireporting.backend.repository.FileColumnMappingRepository;
import com.aireporting.backend.repository.UploadedFileRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIAnalysisService {

    private final UploadedFileRepository uploadedFileRepository;
    private final FileColumnMappingRepository fileColumnMappingRepository;
    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    public String sendFileToPythonAI(Long fileId, String query) {
        UploadedFile file = uploadedFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(file.getStoragePath())
                .build();

        ResponseInputStream<GetObjectResponse> s3ObjectStream = s3Client.getObject(getObjectRequest);

        InputStreamResource resource = new InputStreamResource(s3ObjectStream) {
            @Override
            public String getFilename() {
                return file.getFileName();
            }
            @Override
            public long contentLength() {
                return file.getFileSize();
            }
        };

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
        body.add("file", resource);
        body.add("mapping_json", mappingJsonStr);

        // Sorgu varsa, body'e ekliyoruz
        if (query != null && !query.isEmpty()) {
            body.add("query", query);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        RestTemplate restTemplate = new RestTemplate();
        // Python servisinin adresini buraya yazın
        String pythonApiUrl = "http://localhost:8000/analyze";
        ResponseEntity<String> response = restTemplate.postForEntity(pythonApiUrl, requestEntity, String.class);

        return response.getBody();
    }
}