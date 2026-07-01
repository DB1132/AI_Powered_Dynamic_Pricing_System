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
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/pricing")
public class PricingController {
    @Autowired
    PricingService pricingService;

    @Autowired
    PriceHistoryRepository historyRepository;

    @Autowired
    ProductRepository  productRepository;

    @Autowired
    PriceHistory h;

    @PostMapping("/optimize/{id}")
    public Map<String,Object> optimize(@PathVariable Long id) {
        Product p = productRepository.findById(id).orElseThrow();

        RestTemplate rest = new RestTemplate();

        Map<String,Object> req = new HashMap<>();
        req.put("Price", p.getCurrentPrice());
        req.put("Discount", p.getDiscount());
        req.put("Inventory Level", p.getInventoryLevel());
        req.put("Competitor Pricing", p.getCompetitorPrice());
        req.put("Category", p.getCategory());
        req.put("Region", p.getRegion());
        req.put("Promotion", p.isPromotion() ? 1 : 0);
        req.put("Epidemic", p.isEpidemic() ? 1 : 0);

        ResponseEntity<Map> response = rest.postForEntity(
                "http://localhost:5000/optimize-price",
                req,
                Map.class
        );

        Map result = response.getBody();

        h.setProductId(p.getId());

        h.setOldPrice(p.getCurrentPrice());
        h.setNewPrice(((Number) result.get("optimal_price")).doubleValue());
        h.setPredictedDemand(((Number) result.get("expected_demand")).doubleValue());

        h.setExpectedRevenue(((Number) result.get("expected_revenue")).doubleValue());

        h.setUpdatedAt(LocalDateTime.now());

        historyRepository.save(h);

        return response.getBody();
    }

    @GetMapping("/history/{productId}")
    public List<PriceHistory> getHistory(@PathVariable Long productId) {
        return historyRepository.findByProductId(productId);
    }

}
