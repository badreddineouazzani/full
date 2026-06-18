# DemoLogin — Architecture Diagrams

Mermaid diagrams describing the structure and flows of `DemoLogin/src`.

## 1. Component / Module Structure

```mermaid
graph TD
  main["main.tsx<br/>(entry point)"]
  BrowserRouter["BrowserRouter"]
  LocaleProvider["LocaleProvider<br/>(services/i18n)"]
  IntlProvider["IntlProvider (react-intl)"]
  App["App.tsx<br/>(Routes)"]

  main --> BrowserRouter --> LocaleProvider --> IntlProvider --> App

  App --> LoginRoute --> Login["login.tsx"]
  App --> RegisterRoute --> Register["Register.tsx"]
  App --> HomeRoute --> Home["Home.tsx"]
  App --> AdminRoute --> SuperAdmin["admin/SuperAdminDashboard.tsx"]

  Home --> ProduitCard["ProduitCard.tsx"]
  Home --> AddProduct["AddProduct.tsx"]
  Home --> EditProduct["EditProduct.tsx"]

  LocaleProvider -. reads .-> translations["translations/<br/>fr.json · en.json · ar.json"]
  IntlProvider -. messages .-> translations

  Home -. useLocale .-> LocaleProvider
  Login -. FormattedMessage .-> IntlProvider
  Register -. useIntl .-> IntlProvider
  SuperAdmin -. useLocale/useIntl .-> LocaleProvider

  Home --> AppCss["App.css"]
  SuperAdmin --> DashCss["admin/Dashboard.css"]

  classDef provider fill:#e3f2fd,stroke:#1976d2;
  classDef page fill:#f1f8e9,stroke:#558b2f;
  classDef leaf fill:#fff3e0,stroke:#ef6c00;
  class BrowserRouter,LocaleProvider,IntlProvider provider;
  class Login,Register,Home,SuperAdmin page;
  class ProduitCard,AddProduct,EditProduct leaf;
```

## 2. Routing

```mermaid
graph LR
  root["/"] -->|redirect| loginR["/:locale/login"]
  star["* (unknown)"] -->|redirect| loginR

  homeR["/:locale"]
  registerR["/:locale/register"]
  adminR["/:locale/admin"]

  loginR -->|"hasToken()"| homeR
  registerR -->|"hasToken()"| homeR
  homeR -->|"!hasToken()"| loginR
  adminR -->|"!hasToken()"| loginR

  loginR -. onLoginSuccess .-> homeR
  loginR -. onSwitchToRegister .-> registerR
  registerR -. onSwitchToLogin .-> loginR
  homeR -. onOpenAdmin .-> adminR
  adminR -. onBack .-> homeR
  homeR -. onLoggedOut .-> loginR
  adminR -. onLoggedOut .-> loginR

  classDef guarded fill:#ffebee,stroke:#c62828;
  class homeR,adminR guarded;
```

`hasToken()` checks `localStorage.token`. The active `locale` is the first URL
segment (`/ar/register` → `ar`), falling back to stored/`fr`.

## 3. Authentication Flow

```mermaid
sequenceDiagram
  participant U as User
  participant L as Login / Register
  participant API as Backend (localhost:8080)
  participant LS as localStorage
  participant App as App Router

  U->>L: enter credentials, submit
  L->>API: POST /api/auth/login (or /register)
  alt success
    API-->>L: { token }
    L->>LS: setItem("token", token)
    L->>App: onLoginSuccess() → navigate /:locale
  else failure
    API-->>L: !res.ok
    L-->>U: show error message
  end
```

## 4. Home — Product CRUD & State

```mermaid
sequenceDiagram
  participant Home
  participant API as Backend /products
  participant LS as localStorage

  Note over Home: mount
  Home->>API: GET /products (Bearer token)
  alt 401 Unauthorized
    API-->>Home: 401
    Home->>LS: removeItem("token")
    Home->>Home: onLoggedOut()
  else ok
    API-->>Home: Produit[]
  end

  Note over Home: Add (AddProduct modal)
  Home->>API: POST /products
  API-->>Home: ok → fetchProduits()

  Note over Home: Edit (EditProduct modal)
  Home->>API: PUT /products/:id
  API-->>Home: ok → fetchProduits()

  Note over Home: Delete (single / bulk)
  Home->>API: DELETE /products/:id
  API-->>Home: ok → drop from state
```

Client-side pipeline in `Home`: `produits` → **filter** (search + category)
→ **sort** (`newest`/`oldest`/`name-asc`/`name-desc`) → `displayed` →
**slice** by `visibleCount` (infinite scroll via `IntersectionObserver`,
page size 12).

## 5. i18n / Locale Resolution

```mermaid
graph TD
  url["URL path segment"] --> resolve{"valid locale?"}
  stored["localStorage 'locale'"] --> resolve
  default["DEFAULT_LOCALE = 'fr'"] --> resolve
  resolve -->|yes| locale["active locale"]
  resolve -->|no| stored
  locale --> effects["persist to localStorage<br/>set html lang + dir (rtl for ar)"]
  locale --> IntlProvider["IntlProvider messages = CATALOGS[locale]"]
  setLocale["setLocale(next)"] -->|rewrite first segment| navigate["navigate(newPath)"]
  navigate --> url
```

## 6. SuperAdmin Dashboard (mock, local state)

```mermaid
graph TD
  MOCK["MOCK_USERS"] --> users["users state"]
  users --> stats["stats (count by role)"]
  users --> filtered["filtered (search by name/email)"]
  filtered --> table["users table"]
  table -->|changeRole| roleReset["role + ROLE_DEFAULTS[role] permissions"]
  table -->|togglePermission| permFlip["flip single permission"]
  roleReset --> users
  permFlip --> users

  note["TODO: wire backend<br/>GET/PATCH/POST /api/admin/users"]
  note -.-> MOCK
```

Roles: `superadmin · admin · editor · viewer`. Permissions:
`canAdd · canEdit · canDelete`. Data is mocked in component state — no backend
calls yet.
```