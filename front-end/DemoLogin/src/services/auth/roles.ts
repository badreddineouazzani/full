// Canonical role/permission model shared across the app.
// Keep this in sync with the roles your Spring Boot backend issues.

export type Role = 'superadmin' | 'admin' | 'editor' | 'viewer';
export type Permission = 'canAdd' | 'canEdit' | 'canDelete';

export const ROLES: Role[] = ['superadmin', 'admin', 'editor', 'viewer'];

// Default product permissions granted by each role.
export const ROLE_DEFAULTS: Record<Role, Record<Permission, boolean>> = {
  superadmin: { canAdd: true,  canEdit: true,  canDelete: true  },
  admin:      { canAdd: true,  canEdit: true,  canDelete: true  },
  editor:     { canAdd: true,  canEdit: true,  canDelete: false },
  viewer:     { canAdd: false, canEdit: false, canDelete: false },
};

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as string[]).includes(value);
}
