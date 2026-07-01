package com.dp.backend.controller;

import com.dp.backend.model.Review;
import com.dp.backend.repository.ReviewRepository;
import com.dp.backend.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/ai")
@CrossOrigin
public class AiController {
    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/description/{productId}")
    public Map<String,String> getDescription(@PathVariable int productId){

        List<Review> reviews = reviewRepository.findByProductId(productId);

        String combinedText = reviews.stream()
                .map(Review::getReviewText)
                .collect(Collectors.joining(" "));

        String summary = geminiService.generateSummary(combinedText);

        return Map.of("summary", summary);

    }
}
