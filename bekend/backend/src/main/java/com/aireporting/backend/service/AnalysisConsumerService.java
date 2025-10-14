package com.aireporting.backend.service;

import com.aireporting.backend.config.RabbitMQConfig;
import com.aireporting.backend.entity.AiRequest;
import com.aireporting.backend.entity.AiResult;
import com.aireporting.backend.entity.UploadedFile;
import com.aireporting.backend.entity.User;
import com.aireporting.backend.repository.AiRequestRepository;
import com.aireporting.backend.repository.AiResultRepository;
import com.aireporting.backend.repository.UploadedFileRepository;
import com.aireporting.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor // DÜZELTME: Constructor injection için Lombok anotasyonu
public class AnalysisConsumerService {

    private static final Logger log = LoggerFactory.getLogger(AnalysisConsumerService.class);

    // DÜZELTME: @Autowired yerine final ve constructor injection
    private final AIAnalysisService aiAnalysisService;
    private final AiRequestRepository aiRequestRepository;
    private final AiResultRepository aiResultRepository;
    private final UploadedFileRepository uploadedFileRepository;
    private final UserRepository userRepository;
    private final FileService fileService; // FileService'i de ekliyoruz.


    @Value("${ai.analysis.api.url:http://localhost:8000/analyze}") // Python API adresi (varsayılan değer ile)
    private String pythonApiUrl;


    @RabbitListener(queues = RabbitMQConfig.ANALYSIS_QUEUE)
    @Transactional
    public void handleAnalysisRequest(Map<String, Object> message) {
        Long fileId = Long.parseLong(message.get("fileId").toString());
        String query = (String) message.get("query");
        String templateId = (String) message.get("templateId"); // YENİ

        log.info("Kuyruktan analiz talebi alındı: fileId={}, query='{}', templateId='{}'", fileId, query, templateId);

        // Dosya ve kullanıcı bilgilerini al
        UploadedFile file = uploadedFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Analiz için dosya bulunamadı: " + fileId));

        User user = file.getUploadedBy();

        // Analiz isteği kaydını oluştur
        AiRequest request = AiRequest.builder()
                .file(file)
                .user(user)
                .status("PROCESSING")
                .build();
        aiRequestRepository.save(request);

        try {
            // 1. Dosya içeriğini FileService üzerinden S3'ten al
            byte[] fileContent = fileService.downloadFileContent(file.getStoragePath()); // DÜZELTME: getS3Key() -> getStoragePath()

            // 2. Python AI servisine göndermek için isteği hazırla
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

            // Dosya içeriğini ByteArrayResource olarak ekle
            ByteArrayResource fileResource = new ByteArrayResource(fileContent) {
                @Override
                public String getFilename() {
                    return file.getFileName(); // DÜZELTME: getOriginalFilename() -> getFileName()
                }
            };
            body.add("file", fileResource);

            // Gelen query boş değilse ekle
            if (query != null && !query.isEmpty()) {
                body.add("query", query);
            }

            // YENİ: Gelen templateId boş değilse ekle
            if (templateId != null && !templateId.isEmpty()) {
                body.add("template_id", templateId);
            }

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // 3. Python AI servisine POST isteği gönder
            RestTemplate restTemplate = new RestTemplate();
            log.info("Python AI servisine istek gönderiliyor: {}", pythonApiUrl);
            ResponseEntity<String> response = restTemplate.postForEntity(pythonApiUrl, requestEntity, String.class);
            log.info("Python AI servisinden yanıt alındı.");

            String resultJson = response.getBody();

            // 4. Sonucu veritabanına kaydet
            AiResult result = AiResult.builder()
                    .request(request)
                    .resultType("advanced_analysis") // Tip şimdilik sabit, daha sonra dinamikleşebilir
                    .resultData(resultJson)
                    .build();
            aiResultRepository.save(result);

            // 5. İstek durumunu 'COMPLETED' olarak güncelle
            request.setStatus("COMPLETED");
            request.setCompletedAt(LocalDateTime.now());
            aiRequestRepository.save(request);

            log.info("Analiz sonucu başarıyla veritabanına kaydedildi. requestId={}", request.getId());

        } catch (Exception e) {
            log.error("Analiz sırasında hata oluştu: fileId={}", fileId, e);

            request.setStatus("FAILED");
            request.setErrorMessage(e.getMessage());
            request.setCompletedAt(LocalDateTime.now());
            aiRequestRepository.save(request);
        }
    }
}