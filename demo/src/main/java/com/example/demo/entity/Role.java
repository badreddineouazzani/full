package com.example.demo.entity;

/**
 * Application roles, ordered from most to least privileged.
 *
 * <p>Constant names are the exact Spring Security authority strings (the
 * {@code ROLE_} prefix is what {@code hasRole('X')} expects) and are also the
 * values persisted in the {@code users.role} column via
 * {@link jakarta.persistence.EnumType#STRING}. Keep all three in sync: enum
 * name == DB value == granted authority.
 */
public enum Role {
    ROLE_SUPERADMIN,
    ROLE_ADMIN,
    ROLE_EDITOR,
    ROLE_VIEWER
}