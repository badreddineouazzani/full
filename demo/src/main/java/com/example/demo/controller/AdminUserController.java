package com.example.demo.controller;

import com.example.demo.dto.UpdateRoleRequest;
import com.example.demo.dto.UpdateUserRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.repository.AppUserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPERADMIN')") // belt-and-suspenders alongside the /api/admin/** rule in SecurityConfig
public class AdminUserController {

    private final AppUserRepository userRepository;

    @GetMapping("/users")
    public List<UserResponse> listUsers() {
        // Soft-deleted users are hidden from the dashboard.
        return userRepository.findByDeletedFalse().stream()
                .map(UserResponse::from)
                .toList();
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest body) {

        return userRepository.findById(id)
                .map(user -> {
                    user.setRole(body.role());
                    return ResponseEntity.ok(UserResponse.from(userRepository.save(user)));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest body) {

        return userRepository.findById(id)
                .map(user -> {
                    user.setRole(body.role());
                    user.setCanAdd(body.canAdd());
                    user.setCanEdit(body.canEdit());
                    user.setCanDelete(body.canDelete());
                    return ResponseEntity.ok(UserResponse.from(userRepository.save(user)));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, Authentication authentication) {
        return userRepository.findById(id)
                .filter(user -> !user.isDeleted())
                .map(user -> {
                    // Don't let a superadmin delete their own account.
                    if (user.getUsername().equals(authentication.getName())) {
                        return ResponseEntity.status(HttpStatus.CONFLICT).<Void>build();
                    }
                    // Soft delete: keep the row, just flag it.
                    user.setDeleted(true);
                    userRepository.save(user);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
