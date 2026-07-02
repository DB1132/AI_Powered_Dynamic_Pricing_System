package com.dp.backend.controller;

import com.dp.backend.model.Product;
import com.dp.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/products")
public class ProductController {
    @Autowired
    ProductRepository productRepository;

    @GetMapping
    public List<Product> getProducts(){
        return productRepository.findAll();
    }

    @PostMapping
    public Product addProduct(@RequestBody Product product){
        return productRepository.save(product);
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id){
        return productRepository.findById(id).orElse(null);
    }

    @PostMapping("/{id}/buy")
    public Product buyProduct(@PathVariable Long id) {
        Product product = productRepository.findById(id).orElseThrow();
        if (product.getInventoryLevel() > 0) {
            product.setInventoryLevel(product.getInventoryLevel() - 1);
            productRepository.save(product);
        }
        return product;
    }
}
