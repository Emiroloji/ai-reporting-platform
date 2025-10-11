// src/main/java/com/aireporting/backend/controller/AIController.java

package com.aireporting.backend.controller;

import com.aireporting.backend.config.RabbitMQConfig;
import com.aireporting.backend.dto.AiRequestDTO;
import com.aireporting.backend.dto.AiResultDTO;
import com.aireporting.backend.entity.AiRequest;
import com.aireporting.backend.entity.AiResult;
import com.aireporting.backend.entity.User;
import com.aireporting.backend.repository.AiRequestRepository;
import com.aireporting.backend.repository.AiResultRepository;
import com.aireporting.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;


import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final RabbitTemplate rabbitTemplate;
    private final AiRequestRepository aiRequestRepository;
    private final UserRepository userRepository;
    private final AiResultRepository aiResultRepository;


    @PostMapping("/{fileId}/analyze")
    public ResponseEntity<?> analyzeFile(
            @PathVariable Long fileId,
            @RequestBody(required = false) Map<String, String> payload // Sorguyu body'den alıyoruz
    ) {
        String query = (payload != null) ? payload.get("query") : null;

        // RabbitMQ'ya Map olarak gönderiyoruz
        Map<String, Object> message = new HashMap<>();
        message.put("fileId", fileId);
        message.put("query", query);

        rabbitTemplate.convertAndSend(RabbitMQConfig.ANALYSIS_QUEUE, message);
        return ResponseEntity.accepted().body("Analiz talebiniz alındı ve işleme konuldu.");
    }


    // YENİ EKLENEN ENDPOINT
    @GetMapping("/history")
    public ResponseEntity<List<AiRequestDTO>> getAnalysisHistory(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<AiRequest> requests = aiRequestRepository.findByUserOrderByCreatedAtDesc(user);

        List<AiRequestDTO> dtos = requests.stream()
                .map(AiRequestDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/result/{requestId}")
    public ResponseEntity<AiResultDTO> getAnalysisResult(@PathVariable Long requestId, Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        AiRequest request = aiRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        AiResult result = aiResultRepository.findByRequest(request)
                .orElseThrow(() -> new RuntimeException("Result not found for this request"));

        // Entity'yi DTO'ya çevirip gönderiyoruz.
        AiResultDTO resultDTO = new AiResultDTO(result);

        return ResponseEntity.ok(resultDTO);
    }
}