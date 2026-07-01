package com.dp.backend.controller;

import com.dp.backend.model.Review;
import com.dp.backend.repository.ReviewRepository;
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
    public List<Review> getReviewsByProduct(@PathVariable int id) {
        return reviewRepository.findByProductId(id);
    }
}
