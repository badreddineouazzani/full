package com.example.demo.controller;

import com.example.demo.dto.RegisterRequest;
import com.example.demo.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;

    @GetMapping("/register")
    public String registerPage() {
        return "register";
    }

//    @PostMapping("/api/auth/register")
//    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
//        registrationService.register(request.getUsername(), request.getPassword());
//        return ResponseEntity.status(HttpStatus.CREATED).body("User créé: " + request.getUsername());
//    }

    @PostMapping("/api/auth/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody RegisterRequest request) {
        String token = registrationService.register(request.getUsername(),request.getPassword());
        return ResponseEntity.ok(Map.of("token", token));
    }
}
