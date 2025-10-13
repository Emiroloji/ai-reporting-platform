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
@RequiredArgsConstructor // DÜZELTME: @Autowired yerine constructor injection kullanıyoruz.
public class AIController {

    private final RabbitTemplate rabbitTemplate;
    private final AiRequestRepository aiRequestRepository;
    private final UserRepository userRepository; // DÜZELTME: UserService yerine UserRepository
    private final AiResultRepository aiResultRepository;


    /**
     * GÜNCELLENMİŞ Asenkron Analiz Başlatma Endpoint'i.
     * Bu endpoint, analizi hemen başlatmak yerine RabbitMQ'ya bir istek mesajı bırakır.
     */
    @PostMapping("/{fileId}/analyze")
    public ResponseEntity<?> analyzeFile(
            @PathVariable Long fileId,
            @RequestBody(required = false) Map<String, String> payload, // Hem 'query' hem de 'templateId' içerebilir
            Authentication authentication
    ) {
        String query = (payload != null) ? payload.get("query") : null;
        String templateId = (payload != null) ? payload.get("templateId") : null;

        // RabbitMQ'ya Map olarak gönderiyoruz
        Map<String, Object> message = new HashMap<>();
        message.put("fileId", fileId);
        message.put("query", query);
        message.put("templateId", templateId); // YENİ

        rabbitTemplate.convertAndSend(RabbitMQConfig.ANALYSIS_QUEUE, message);

        // Frontend'e Map<String, String> formatında bir yanıt gönderiyoruz.
        return ResponseEntity.accepted().body(Map.of("message", "Analiz talebiniz alındı ve işleme konuldu."));
    }

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

        AiResultDTO resultDTO = new AiResultDTO(result);

        return ResponseEntity.ok(resultDTO);
    }
}