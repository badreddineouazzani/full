package com.example.demo.dto;

import com.example.demo.entity.Role;
import jakarta.validation.constraints.NotNull;

/**
 * Payload for {@code PUT /api/admin/users/{id}/role}. An unknown role string
 * fails Jackson enum binding (400); a missing role fails {@link NotNull} (400).
 */
public record UpdateRoleRequest(@NotNull Role role) {}