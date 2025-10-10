// AiResultRepository.java
package com.aireporting.backend.repository;

import com.aireporting.backend.entity.AiRequest;
import com.aireporting.backend.entity.AiResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional; // import et

@Repository
public interface AiResultRepository extends JpaRepository<AiResult, Long> {
    // Yeni eklenen metot
    Optional<AiResult> findByRequest(AiRequest request);
}