// AiResultRepository.java
package com.aireporting.backend.repository;

import com.aireporting.backend.entity.AiResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiResultRepository extends JpaRepository<AiResult, Long> {
}