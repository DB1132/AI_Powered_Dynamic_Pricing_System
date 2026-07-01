package com.dp.backend.controller;

import com.dp.backend.model.Review;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@CrossOrigin
public class ReviewController {

    @Autowired
    ReviewRepository reviewRepository;

    @GetMapping("/{id}")
    public List<Review> getReviewsByProduct(@PathVariable Long id) {
        return reviewRepository.findByProductId(id);
    }
}
