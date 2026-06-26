package com.example.demo.dto;

import com.example.demo.entity.Role;
import jakarta.validation.constraints.NotNull;

/**
 * Payload for {@code PUT /api/admin/users/{id}} — sets a user's role and their
 * individual product permissions in one call. An unknown role fails Jackson
 * enum binding (400); a missing role fails {@link NotNull} (400).
 */
public record UpdateUserRequest(
        @NotNull Role role,
        boolean canAdd,
        boolean canEdit,
        boolean canDelete) {}