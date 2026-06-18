import { useMemo } from 'react'
import { ROLE_DEFAULTS, isRole, type Permission, type Role } from './roles'

const TOKEN_KEY = 'token';

// Role assumed when the JWT carries no role claim (the current backend state).
// Keep "viewer" for safety; switch to "superadmin" during local dev to exercise
// every gated control until the backend signs a real role.
const FALLBACK_ROLE: Role = 'superadmin';

export interface CurrentUser {
  username: string;
  role: Role;
  permissions: Record<Permission, boolean>;
}

// Decode a JWT payload (base64url). This does NOT verify the signature — that is
// the server's job; we only read claims to drive the UI.
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(atob(base64))));
  } catch {
    return null;
  }
}

function normalizeRole(value: string): string {
  // Spring tends to emit authorities like "ROLE_ADMIN"; normalize to "admin".
  return value.replace(/^ROLE_/i, '').toLowerCase();
}

// TODO: align these claim names with what the backend actually signs.
// Handles `role: "ADMIN"`, `roles: [...]`, and `authorities: [{ authority }]`.
function extractRole(payload: Record<string, unknown>): string | null {
  if (typeof payload.role === 'string') return normalizeRole(payload.role);

  const list = payload.roles ?? payload.authorities;
  if (Array.isArray(list)) {
    for (const item of list) {
      const raw =
        typeof item === 'string'
          ? item
          : (item as { authority?: unknown })?.authority;
      if (typeof raw === 'string') return normalizeRole(raw);
    }
  }
  return null;
}

function readCurrentUser(token: string | null): CurrentUser | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const username = typeof payload.sub === 'string' ? payload.sub : '';
  const rawRole = extractRole(payload);
  const role: Role = isRole(rawRole) ? rawRole : FALLBACK_ROLE;

  return { username, role, permissions: ROLE_DEFAULTS[role] };
}

/**
 * Reads the authenticated user from the JWT in localStorage.
 *
 * STUB: token-based and non-reactive — it re-reads on each render and won't
 * update mid-render if another tab changes the token. Good enough for route
 * guards today; swap for a context/SWR-backed source when auth is finalized.
 */
export function useCurrentUser() {
  const token = localStorage.getItem(TOKEN_KEY);
  const user = useMemo(() => readCurrentUser(token), [token]);

  return useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      hasRole: (...roles: Role[]) => user !== null && roles.includes(user.role),
      can: (perm: Permission) => user?.permissions[perm] ?? false,
    }),
    [user]
  );
}
