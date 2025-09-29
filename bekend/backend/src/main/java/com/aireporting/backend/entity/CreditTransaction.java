package com.aireporting.backend.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "credit_transaction")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String transactionType;
    private Integer amount;
    private String description;

    private LocalDateTime createdAt = LocalDateTime.now();
}
