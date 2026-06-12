package com.example.demo.service;

import com.example.demo.entity.AppUser;
import com.example.demo.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final AppUserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public void register(String username, String rawPassword) {
        if (repository.findByUsername(username).isPresent()) {
            throw new IllegalStateException("Username already taken");
        }

        AppUser user = new AppUser();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword));
        repository.save(user);
    }
}