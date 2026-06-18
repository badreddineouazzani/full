package com.example.demo.controller;

import com.example.demo.entity.Product;
import com.example.demo.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/products")
    public List<Product> findProducts() {
        return productService.findAllProducts();
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        productService.deleteProductById(id);
        return ResponseEntity.noContent().build();   // 204
    }

    @PostMapping("/products")
    public Product create(@RequestBody Product produit) {
        return productService.saveProduct(produit);
    }

    @PutMapping("/products/{id}")
    public Product update(@PathVariable int id, @RequestBody Product produit) {
        return productService.updateProduct(id, produit);
    }
}