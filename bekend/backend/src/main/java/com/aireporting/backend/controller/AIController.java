package com.aireporting.backend.controller;

import com.aireporting.backend.service.AIAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIAnalysisService aiAnalysisService;

    // DosyaId ile analiz endpointi
    @PostMapping("/{fileId}/analyze")
    public ResponseEntity<?> analyzeFile(@PathVariable Long fileId) {
        try {
            String resultJson = aiAnalysisService.sendFileToPythonAI(fileId);
            return ResponseEntity.ok(resultJson);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("AI analiz hatası: " + e.getMessage());
        }
    }
}