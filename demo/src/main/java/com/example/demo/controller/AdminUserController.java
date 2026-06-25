package com.example.demo.controller;

import com.example.demo.dto.AdminUserDto;
import com.example.demo.dto.UpdateUserRequest;
import com.example.demo.entity.AppUser;
import com.example.demo.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminUserController {

    private final AppUserRepository userRepository;

    @GetMapping("/users")
    public List<AdminUserDto> listUsers() {
        return userRepository.findAll().stream()
                .map(u -> new AdminUserDto(u.getId(), u.getUsername(), List.of(u.getRole())))
                .toList();
    }

    @PatchMapping("/users/{id}")
    public ResponseEntity<AdminUserDto> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest body) {

        return userRepository.findById(id)
                .map(user -> {
                    if (body.role() != null) {
                        user.setRole(toSpringRole(body.role()));
                    }
                    AppUser saved = userRepository.save(user);
                    return ResponseEntity.ok(
                            new AdminUserDto(saved.getId(), saved.getUsername(), List.of(saved.getRole())));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Maps frontend role names (superadmin/admin/editor/viewer) to Spring authority strings.
    private static final Map<String, String> ROLE_MAP = Map.of(
            "superadmin", "ROLE_SUPERADMIN",
            "admin",      "ROLE_ADMIN",
            "editor",     "ROLE_EDITOR",
            "viewer",     "ROLE_USER"
    );

    private String toSpringRole(String frontendRole) {
        return ROLE_MAP.getOrDefault(frontendRole.toLowerCase(), "ROLE_USER");
    }
}