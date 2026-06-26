package com.example.demo.dto;

import com.example.demo.entity.AppUser;
import com.example.demo.entity.Role;

/**
 * Client-facing view of a user. {@code role} serializes to its authority
 * string (e.g. {@code "ROLE_ADMIN"}); the booleans are the per-user product
 * permissions.
 */
public record UserResponse(
        Long id,
        String username,
        Role role,
        boolean canAdd,
        boolean canEdit,
        boolean canDelete) {

    public static UserResponse from(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.isCanAdd(),
                user.isCanEdit(),
                user.isCanDelete());
    }
}