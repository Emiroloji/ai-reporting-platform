// src/main/java/com/aireporting/backend/repository/AiRequestRepository.java

package com.aireporting.backend.repository;

import com.aireporting.backend.entity.AiRequest;
import com.aireporting.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List; // import et

@Repository
public interface AiRequestRepository extends JpaRepository<AiRequest, Long> {
    // Yeni eklenen metot
    List<AiRequest> findByUserOrderByCreatedAtDesc(User user);
}