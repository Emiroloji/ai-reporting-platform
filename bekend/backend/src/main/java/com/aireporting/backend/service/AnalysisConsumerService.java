package com.aireporting.backend.service;

import com.aireporting.backend.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AnalysisConsumerService {

    private static final Logger log = LoggerFactory.getLogger(AnalysisConsumerService.class);
    private final AIAnalysisService aiAnalysisService;

    @RabbitListener(queues = RabbitMQConfig.ANALYSIS_QUEUE)
    public void handleAnalysisRequest(Long fileId) {
        log.info("Kuyruktan analiz talebi alındı: fileId={}", fileId);
        try {
            String result = aiAnalysisService.sendFileToPythonAI(fileId);
            log.info("Analiz tamamlandı. fileId={}, Sonuç: {}", fileId, result);
            // İleride bu sonucu veritabanına kaydedebilir veya kullanıcıya bildirim gönderebiliriz.
        } catch (Exception e) {
            log.error("Analiz sırasında hata oluştu: fileId={}", fileId, e);
        }
    }
}