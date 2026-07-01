package com.dp.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "products")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="product_name")
    private String productName;

    @Column(name="current_price")
    private double currentPrice;

    @Column(name="competitor_price")
    private double competitorPrice;

    @Column(name="discount")
    private double discount;

    @Column(name="inventory_level")
    private int inventoryLevel;

    private String category;

    private String region;

    private boolean promotion;

    private boolean epidemic;
}
