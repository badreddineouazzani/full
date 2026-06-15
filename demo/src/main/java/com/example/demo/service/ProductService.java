package com.example.demo.service;

import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;


@Service

public class ProductService{
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> findAllProducts() {
        return productRepository.findAll();
    }

    public Product findProductById(@PathVariable int id) {
        return productRepository.findById(id).orElseThrow();
    }
    public Product saveProduct(Product product) {
       return productRepository.save(product);
    }
    public void deleteProductById(int id) {
        productRepository.deleteById(id);
    }

}