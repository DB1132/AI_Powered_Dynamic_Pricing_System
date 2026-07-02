package com.dp.backend.service;

import com.dp.backend.model.PriceHistory;
import com.dp.backend.model.Product;
import com.dp.backend.repository.PriceHistoryRepository;
import com.dp.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class PricingService {


    @Autowired
    ProductRepository productRepository;

    @Autowired
    PriceHistoryRepository historyRepository;

    @Autowired
    MLService mlService;

    public Map<String,Object> optimizeProduct(Long productId){

        Product product = productRepository.findById(productId).orElseThrow();

        Map<String,Object> data = new HashMap<>();

        data.put("Price", product.getCurrentPrice());
        data.put("Competitor Pricing", product.getCompetitorPrice());
        data.put("Discount", product.getDiscount());
        data.put("Promotion", product.isPromotion() ? 1 : 0);
        data.put("Inventory Level", product.getInventoryLevel());
        data.put("Category", product.getCategory());
        data.put("Region", product.getRegion());
        data.put("Epidemic", product.isEpidemic() ? 1 : 0);

        Map<String,Object> result = mlService.getOptimalPrice(data);

        double optimalPrice = ((Number) result.get("optimal_price")).doubleValue();
        double demand = ((Number) result.get("expected_demand")).doubleValue();
        double revenue = ((Number) result.get("expected_revenue")).doubleValue();
        product.setCurrentPrice(optimalPrice);
        productRepository.save(product);
        PriceHistory history = new PriceHistory();

        history.setProductId(productId);
        history.setOldPrice(product.getCurrentPrice());
        history.setNewPrice(optimalPrice);
        history.setPredictedDemand(demand);
        history.setExpectedRevenue(revenue);
        history.setUpdatedAt(LocalDateTime.now());

        historyRepository.save(history);

        return result;
    }
}
