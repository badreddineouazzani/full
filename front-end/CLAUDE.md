# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project layout

The actual application lives in [DemoLogin/](DemoLogin/) — all commands below
must be run from that directory, not the repo root. It is a React 19 + TypeScript
+ Vite SPA (a product catalog with auth, role-based UI, and i18n) that talks to a
separate Spring Boot backend.

## Commands

Run from [DemoLogin/](DemoLogin/):

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then build for production
- `npm run lint` — run ESLint over the project
- `npm run preview` — serve the production build locally

There is no test runner configured in this project.

## Backend dependency

The frontend expects a Spring Boot backend at `http://localhost:8080` (hard-coded
in components, e.g. `POST /api/auth/login`, `/api/auth/register`, and the
`/products` CRUD endpoints). The base URL is not centralized — it is repeated in
each `fetch` call. Auth is JWT-based: the token is stored in `localStorage` under
the key `token` and sent as `Authorization: Bearer <token>`. A `401` from the
products endpoint clears the token and logs the user out.

## Architecture

A full set of Mermaid diagrams (component structure, routing, auth flow, product
CRUD pipeline, i18n resolution, SuperAdmin dashboard) lives in
[DemoLogin/src/ARCHITECTURE.md](DemoLogin/src/ARCHITECTURE.md) — read it first;
the notes below cover only the load-bearing, non-obvious points.

**Provider stack** ([main.tsx](DemoLogin/src/main.tsx)):
`BrowserRouter` → `LocaleProvider` → `IntlProvider` → `App`. The router must wrap
`LocaleProvider` because locale is derived from the URL.

**Routing & auth guards** ([App.tsx](DemoLogin/src/App.tsx)): routes are
locale-prefixed (`/:locale`, `/:locale/login`, `/:locale/register`,
`/:locale/admin`). Guards are inline in route wrapper components based on
`hasToken()` (presence of `localStorage.token`). Pages communicate navigation
back to `App` through callback props (`onLoginSuccess`, `onLoggedOut`,
`onOpenAdmin`, etc.) rather than navigating themselves.

**i18n** ([services/i18n/LocaleContext.tsx](DemoLogin/src/services/i18n/LocaleContext.tsx)):
the URL's first path segment is the source of truth for locale (`fr`/`en`/`ar`),
falling back to `localStorage` then `DEFAULT_LOCALE='fr'`. `setLocale` rewrites
the first path segment so URLs stay shareable. Arabic (`ar`) triggers
`dir="rtl"` on `<html>`. Translation catalogs are JSON in
[src/translations/](DemoLogin/src/translations/); use `react-intl`
(`FormattedMessage` / `useIntl`) for user-facing strings.

**Roles & permissions** ([services/auth/](DemoLogin/src/services/auth/)): the
canonical role/permission model is in `roles.ts` (`superadmin`/`admin`/`editor`/
`viewer` × `canAdd`/`canEdit`/`canDelete`). `useCurrentUser` decodes the JWT
client-side (no signature verification — UI only) and exposes `hasRole` / `can`.

### Important: auth is still stubbed against the backend

Several flags exist because the backend JWT does not yet carry a role claim.
When wiring real role enforcement, update all of these together:

- `ENFORCE_ADMIN_ROLE` in [App.tsx](DemoLogin/src/App.tsx) is `false` — the admin
  route is currently reachable by any authenticated user. Flip to `true` once the
  JWT includes a role.
- `FALLBACK_ROLE` in
  [useCurrentUser.ts](DemoLogin/src/services/auth/useCurrentUser.ts) is
  `'superadmin'`, so with no role claim every gated control is unlocked.
- `extractRole` handles `role`, `roles`, and Spring-style `authorities`
  (`ROLE_ADMIN` → `admin`); align these claim names with what the backend signs.
- The SuperAdmin dashboard
  ([admin/SuperAdminDashboard.tsx](DemoLogin/src/admin/SuperAdminDashboard.tsx))
  operates on `MOCK_USERS` in local state — no backend calls yet.

## Conventions

- The React Compiler is enabled via Babel in
  [vite.config.ts](DemoLogin/vite.config.ts); avoid manual memoization that the
  compiler handles, and do not break the rules of hooks.
- ESLint flat config ([eslint.config.js](DemoLogin/eslint.config.js)) uses
  recommended JS/TS rules plus react-hooks and react-refresh; type-aware rules
  are not enabled.
