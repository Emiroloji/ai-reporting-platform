// src/main/java/com/aireporting/backend/service/AnalysisConsumerService.java

package com.aireporting.backend.service;

import com.aireporting.backend.config.RabbitMQConfig;
import com.aireporting.backend.entity.AiRequest;
import com.aireporting.backend.entity.AiResult;
import com.aireporting.backend.entity.UploadedFile;
import com.aireporting.backend.repository.AiRequestRepository;
import com.aireporting.backend.repository.AiResultRepository;
import com.aireporting.backend.repository.UploadedFileRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AnalysisConsumerService {

    private static final Logger log = LoggerFactory.getLogger(AnalysisConsumerService.class);

    // Gerekli servis ve repository'leri inject ediyoruz.
    private final AIAnalysisService aiAnalysisService;
    private final AiRequestRepository aiRequestRepository;
    private final AiResultRepository aiResultRepository;
    private final UploadedFileRepository uploadedFileRepository;

    @RabbitListener(queues = RabbitMQConfig.ANALYSIS_QUEUE)
    @Transactional // Bu metodun tamamının bir veritabanı işlemi olduğunu belirtir.
    public void handleAnalysisRequest(Long fileId) {
        log.info("Kuyruktan analiz talebi alındı: fileId={}", fileId);

        // Dosya ve sahibi olan kullanıcıyı buluyoruz.
        UploadedFile file = uploadedFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Analiz için dosya bulunamadı: " + fileId));

        // 1. Yeni bir analiz isteği oluşturup veritabanına kaydediyoruz.
        AiRequest request = AiRequest.builder()
                .file(file)
                .user(file.getUploadedBy())
                .status("PROCESSING") // Durumu "İşleniyor" olarak ayarlıyoruz.
                .build();
        aiRequestRepository.save(request);

        try {
            // 2. Python AI servisine dosyayı gönderip sonucu alıyoruz.
            String resultJson = aiAnalysisService.sendFileToPythonAI(fileId);
            log.info("Analiz tamamlandı. fileId={}, Sonuç alınıyor...", fileId);

            // 3. Başarılı olursa, sonucu yeni bir AiResult nesnesi olarak oluşturuyoruz.
            AiResult result = AiResult.builder()
                    .request(request)
                    .resultType("basic_analysis")
                    .resultData(resultJson) // Python'dan gelen JSON string'ini direkt kaydediyoruz.
                    .build();
            aiResultRepository.save(result);

            // 4. İstek kaydının durumunu "Tamamlandı" olarak güncelliyoruz.
            request.setStatus("COMPLETED");
            request.setCompletedAt(LocalDateTime.now());
            aiRequestRepository.save(request);

            log.info("Analiz sonucu başarıyla veritabanına kaydedildi. requestId={}", request.getId());

        } catch (Exception e) {
            log.error("Analiz sırasında hata oluştu: fileId={}", fileId, e);

            // 5. Hata olursa, isteğin durumunu "Hatalı" olarak güncelliyoruz ve hata mesajını kaydediyoruz.
            request.setStatus("FAILED");
            request.setErrorMessage(e.getMessage());
            request.setCompletedAt(LocalDateTime.now());
            aiRequestRepository.save(request);
        }
    }
}