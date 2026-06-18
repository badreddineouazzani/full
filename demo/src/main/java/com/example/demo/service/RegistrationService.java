package com.example.demo.service;

import com.example.demo.entity.AppUser;
import com.example.demo.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final AppUserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public String register(String username, String rawPassword) {
        if (repository.findByUsername(username).isPresent()) {
            throw new IllegalStateException("Username already taken");
        }

        AppUser user = new AppUser();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword));
        repository.save(user);
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        return jwtService.generateToken(userDetails);
    }
}