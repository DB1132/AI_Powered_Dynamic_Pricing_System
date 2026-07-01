package com.dp.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "price_history")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class PriceHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productId;

    private double oldPrice;

    private double newPrice;

    private double predictedDemand;

    private double expectedRevenue;

    private LocalDateTime updatedAt;
}
