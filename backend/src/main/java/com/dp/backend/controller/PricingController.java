package com.dp.backend.controller;

import com.dp.backend.model.PriceHistory;
import com.dp.backend.model.Product;
import com.dp.backend.repository.PriceHistoryRepository;
import com.dp.backend.repository.ProductRepository;
import com.dp.backend.service.PricingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/pricing")
public class PricingController {

    @Autowired
    PriceHistoryRepository historyRepository;

    @Autowired
    PricingService pricingService;

    @PostMapping("/optimize/{id}")
    public Map<String,Object> optimize(@PathVariable Long id) {
        return pricingService.optimizeProduct(id);
    }

    @GetMapping("/history/{productId}")
    public List<PriceHistory> getHistory(@PathVariable Long productId) {
        return historyRepository.findByProductId(productId);
    }

}
