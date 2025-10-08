package com.aireporting.backend.controller;

import com.aireporting.backend.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final RabbitTemplate rabbitTemplate;

    @PostMapping("/{fileId}/analyze")
    public ResponseEntity<?> analyzeFile(@PathVariable Long fileId) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.ANALYSIS_QUEUE, fileId);
        return ResponseEntity.accepted().body("Analiz talebiniz alındı ve işleme konuldu.");
    }
}