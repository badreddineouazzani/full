package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;

@RestController

public class TestController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/test-db")
    public String testConnection() {
        try {
            Connection conn = dataSource.getConnection();
            conn.close();
            return "✅ Database connected!";
        } catch (Exception e) {
            return "❌ Failed: " + e.getMessage();
        }
    }



}
