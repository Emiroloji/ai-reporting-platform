package com.aireporting.backend.service;

import com.aireporting.backend.entity.CreditTransaction;
import com.aireporting.backend.entity.User;
import com.aireporting.backend.repository.CreditTransactionRepository;
import com.aireporting.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreditService {
    private final UserRepository userRepository;
    private final CreditTransactionRepository creditTransactionRepository;

    @Transactional
    public void useCredits(User user, int amount, String description) {
        if (amount <= 0) throw new IllegalArgumentException("Kredi miktarı pozitif olmalı!");
        if (user.getCredits() < amount) throw new IllegalArgumentException("Yetersiz kredi!");

        user.setCredits(user.getCredits() - amount);
        userRepository.save(user);

        creditTransactionRepository.save(CreditTransaction.builder()
                .user(user)
                .transactionType("USE")
                .amount(-amount)
                .description(description)
                .build());
    }
}