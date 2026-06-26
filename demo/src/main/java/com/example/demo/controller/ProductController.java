package com.example.demo.controller;

import com.example.demo.entity.Product;
import com.example.demo.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // Read is open to any authenticated user; mutations are gated on the
    // caller's individual permission flags (principal is the AppUser entity).
    @GetMapping("/products")
    public List<Product> findProducts() {
        return productService.findAllProducts();
    }

    @PreAuthorize("principal.canDelete")
    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        productService.deleteProductById(id);
        return ResponseEntity.noContent().build();   // 204
    }

    @PreAuthorize("principal.canAdd")
    @PostMapping("/products")
    public Product create(@RequestBody Product produit) {
        return productService.saveProduct(produit);
    }

    @PreAuthorize("principal.canEdit")
    @PutMapping("/products/{id}")
    public Product update(@PathVariable int id, @RequestBody Product produit) {
        return productService.updateProduct(id, produit);
    }
}