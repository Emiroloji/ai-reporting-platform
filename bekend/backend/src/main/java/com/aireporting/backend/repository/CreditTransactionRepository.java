package com.aireporting.backend.repository;

import com.aireporting.backend.entity.CreditTransaction;
import com.aireporting.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {
    List<CreditTransaction> findByUserOrderByCreatedAtDesc(User user);
}