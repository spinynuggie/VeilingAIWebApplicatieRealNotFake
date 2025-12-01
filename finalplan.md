## 1. Backend: Auth, Current User, Roles

### 1.1 Goals

- Move from stateless login responses to **session‑based auth with cookies**.
- Provide a **current user endpoint** for the frontend.
- Introduce simple **roles** (`KOPER`, `VERKOPER`, `ADMIN`).
- Hash passwords using **Argon2id** instead of storing them in plain text.

### 1.2 Data model

- Model: `backend/Models/Gebruiker.cs`
  - Add a `Role` property:
    - `public string Role { get; set; } = "KOPER";`
  - Keep existing fields: `GebruikerId`, `Naam`, `Emailadres`, `Wachtwoord`, `Straat`, `Huisnummer`, `Postcode`, `Woonplaats`.
  - Apply a migration to add the column in the DB.

### 1.3 Cookie authentication

- File: `backend/Program.cs`
  - Configure **cookie auth** with ASP.NET Core:
    - Use `CookieAuthenticationDefaults.AuthenticationScheme`.
    - Cookie name: `auth`.
    - `HttpOnly = true`.
    - For different frontend/backend origins, use `SameSite = None` and `Secure` cookies (requires HTTPS in dev), otherwise you can relax to `Lax` on same origin.
  - Add `builder.Services.AddAuthorization();`.
  - Middleware order:
    - `app.UseCors("AllowFrontend");`
    - `app.UseRouting();`
    - `app.UseAuthentication();`
    - `app.UseAuthorization();`
    - `app.MapControllers();`
  - Keep CORS policy as:
    - `.WithOrigins(frontendUrl).AllowAnyHeader().AllowAnyMethod().AllowCredentials();`

### 1.4 Password hashing with Argon2id

- Create `backend/Services/PasswordHasher.cs` using **Konscious.Security.Cryptography.Argon2id**:
  - `Hash(string password)`:
    - Generate a random salt.
    - Configure Argon2id (memory, iterations, parallelism) with reasonable defaults.
    - Output `salt + hash` as a single base64 string.
  - `Verify(string password, string stored)`:
    - Split `stored` into salt + hash.
    - Recompute Argon2id with the same parameters.
    - Compare using `CryptographicOperations.FixedTimeEquals`.

- Use `PasswordHasher` in `GebruikerController`:
  - On **register** and any raw `POST /api/Gebruiker` for creating a user:
    - Replace `gebruiker.Wachtwoord = ...` with `PasswordHasher.Hash(gebruiker.Wachtwoord)`.
    - Default `Role` to `KOPER` if empty.
  - On **login**:
    - Validate with `PasswordHasher.Verify(loginRequest.Wachtwoord, gebruiker.Wachtwoord)`.
    - Optionally allow a temporary fallback to plain text if you have legacy accounts and then migrate.

### 1.5 Login, current user, logout

- File: `backend/Controllers/GebruikerController.cs`

1. **Login** — `POST /api/Gebruiker/login`
   - Validate `emailadres` and `wachtwoord` not empty.
   - Find user by email.
   - Verify password via Argon2id.
   - If valid, create claims:
     - `ClaimTypes.NameIdentifier` = `GebruikerId`.
     - `ClaimTypes.Email` = `Emailadres`.
     - `ClaimTypes.Role` = `Role` (`KOPER` by default).
   - Call `HttpContext.SignInAsync` with a `ClaimsPrincipal` using the cookie scheme.
   - Return a simple success message.

2. **Current user** — `GET /api/Gebruiker/me` (authorized)
   - `[Authorize]` attribute.
   - Read user id from `User.FindFirst(ClaimTypes.NameIdentifier)`.
   - Fetch the `Gebruiker` from the DB.
   - Return a **camelCase JSON** object so the frontend can map directly:
     - `{ gebruikerId, naam, emailadres, role, straat, huisnummer, postcode, woonplaats }`.

3. **Logout** — `POST /api/Gebruiker/logout` (authorized)
   - `[Authorize]` attribute.
   - Use `HttpContext.SignOutAsync()` to clear the auth cookie.
   - Return `204 NoContent`.

### 1.6 Roles usage

- Simple role names: `KOPER`, `VERKOPER`, `ADMIN`.
- Optional server‑side enforcement with attributes on controllers or actions:
  - `[Authorize(Roles = "ADMIN")]` for admin endpoints.
  - `[Authorize(Roles = "VERKOPER,ADMIN")]` for seller‑only functionality.
- Seed at least one `ADMIN` user at the DB level for testing.

---

## 2. Frontend: Auth, Roles, Route Protection

### 2.1 Types

- File: `frontend/types/user.ts`
  - `export type Role = 'KOPER' | 'VERKOPER' | 'ADMIN';`
  - `export interface User {`
    - `gebruikerId: number;`
    - `emailadres: string;`
    - `naam?: string;`
    - `role: Role;`
    - `straat?: string | null;`
    - `huisnummer?: string | null;`
    - `postcode?: string | null;`
    - `woonplaats?: string | null;`
    - `}`
  - This shape matches the camelCase object from `GET /api/Gebruiker/me`.

### 2.2 Auth service

- File: `frontend/services/authService.ts`
  - Uses `NEXT_PUBLIC_BACKEND_LINK` as `apiBase`.
  - `getCurrentUser(): Promise<User | null>`
    - `GET /api/Gebruiker/me` with `credentials: 'include'`.
    - 401 → return `null`; other non‑OK → throw error.
  - `login(emailadres: string, wachtwoord: string)`
    - `POST /api/Gebruiker/login` with JSON body, `credentials: 'include'`.
    - Throw on non‑OK.
  - `logout()`
    - `POST /api/Gebruiker/logout` with `credentials: 'include'`.

### 2.3 AuthProvider (context)

- File: `frontend/components/AuthProvider.tsx`
  - React context that exposes:
    - `user: User | null`.
    - `loading: boolean`.
    - `error?: string | null`.
    - `refreshUser(): Promise<void>` — calls `getCurrentUser()`.
    - `logout(): Promise<void>` — calls authService.logout and clears local `user`.
  - On mount (`useEffect`), call `refreshUser()` once to hydrate `user` from the backend.
  - Wrap the entire app with `AuthProvider`:
    - In `frontend/app/layout.tsx`, nest `{children}` inside `<AuthProvider>...</AuthProvider>` so all pages can call `useAuth()`.

### 2.4 RequireAuth (client guard)

- File: `frontend/components/RequireAuth.tsx`
  - Props: `roles?: Role[]; children: React.ReactNode`.
  - Behavior:
    - While `loading`, return `null` (or a simple loading state if you prefer).
    - If `user` is null: redirect to `/login` (using `useRouter().push('/login')`).
    - If `roles` is provided and `user.role` is not in it:
      - Show a static message like “Geen toegang” instead of another redirect.
    - Otherwise, render `children`.

### 2.5 Next.js middleware for protected routes

- File: `frontend/middleware.ts`
  - Read the `auth` cookie from the request.
  - Define a list of protected prefixes:
    - `/dashboard`, `/profiel`, `/mijn-biedingen`, `/watchlist`, `/verkopen/:path*`, `/mijn-veilingen`, `/admin`.
  - If the path is protected and cookie is missing:
    - Redirect to `/login?next=<originalPath>` using `NextResponse.redirect`.
  - Export a `config.matcher` that covers those paths.
  - This gives a fast, server‑side guard; the `RequireAuth` component is the client fallback.

### 2.6 Login/Register pages

- `frontend/app/login/page.tsx`
  - Use `authService.login(email, password)` instead of writing `fetch` manually.
  - On success, optionally call `refreshUser()` from `AuthProvider` to sync context, then redirect (e.g. to `/veilingDisplay` or `next` query param).

- `frontend/app/register/page.tsx`
  - Still calls `POST /api/Gebruiker/register` with `credentials: 'include'`.
  - Backend handles hashing and initial role.

---

## 3. Frontend: Pages and Navigation

### 3.1 Global layout and navbar

- File: `frontend/app/layout.tsx`
  - Use `<ThemeProvider>` and MUI `<CssBaseline>`.
  - Wrap contents in `<AuthProvider>`.
  - Add a **skip link** and `<main id="main-content" role="main">` for accessibility.
  - `lang="nl"` on `<html>`.

- Navbar components
  - `frontend/components/NavBar.tsx` remains a generic layout component: left / center / right slots.
  - `frontend/components/AppNavbar.tsx` (wrapper around `NavBar`):
    - Uses `useAuth()` to display different nav items for logged‑in vs logged‑out users.
    - Logged out:
      - Left: `Inloggen`, `registreren`.
      - Right: links like `Toegankelijkheid`, `Privacy`.
    - Logged in:
      - Left: `Dashboard`, `Profiel`.
      - Right:
        - For `VERKOPER` or `ADMIN`: `Mijn veilingen`.
        - For `ADMIN`: `Admin`.
        - `Uitloggen` button that calls `logout()` and redirects to `/`.

### 3.2 Key pages (protected)

- All protected pages use `<RequireAuth>`:
  - `/dashboard`
  - `/profiel`
  - `/instellingen`
  - `/mijn-biedingen`
  - `/watchlist`
  - `/verkopen/nieuw` (roles: `VERKOPER`, `ADMIN`)
  - `/mijn-veilingen` (roles: `VERKOPER`, `ADMIN`)
  - `/admin` (roles: `ADMIN`)

- Page responsibilities (initial simple versions):
  - `/profiel` — shows current user info (email, name, role, address).
  - `/instellingen` — placeholder for password + preferences.
  - `/dashboard` — welcome text + later overview of auctions/bids.
  - `/mijn-biedingen` — list of user’s bids (placeholder initially).
  - `/watchlist` — list of followed auctions.
  - `/verkopen/nieuw` — form to create a new auction.
  - `/mijn-veilingen` — seller’s own auctions.
  - `/admin` — admin dashboard (user/auction management later).

### 3.3 Static pages

- Not protected; simple content:
  - `/toegankelijkheid` — explain accessibility goals and known gaps.
  - `/privacy` — placeholder for privacy policy.
  - `/voorwaarden` — placeholder for terms and conditions.

### 3.4 Veiling list and detail

- `frontend/app/veilingDisplay/page.tsx`
  - Uses `getVeilingen()` from `veilingService` to fetch auctions.
  - Renders `VeilingDisplay` component for current and upcoming auctions.
  - Navbar:
    - Left: logo.
    - Center: `SearchBar`.
    - Right:
      - Logged in: show user name/email and a link to `/mijn-biedingen`.
      - Logged out: `Inloggen` link.

- `frontend/components/VeilingDisplay.tsx`
  - Renders a horizontal scrollable list of auction cards.
  - Each card:
    - Link to `/veiling/[veilingId]`.
    - Image (50% width), title, description snippet.
  - Accessibility:
    - Container has `role="list"` and cards have `role="listitem"`.
    - Cards are proper links (`component={Link}`), keyboard focusable.
    - `onKeyDown` supports Enter/Space to activate the card.

### 3.5 Veiling detail

- `frontend/app/veiling/[veiling]/page.tsx`
  - Reads the id from the URL.
  - Uses `getVeilingen()` (or a dedicated `getVeilingById`) to find the auction.
  - Basic render of name and id; can be extended with a gallery, specs, and bidding form.

---

## 4. Accessibility

### 4.1 Global

- `frontend/app/layout.tsx` and `globals.css`:
  - Skip link: `<a href="#main-content" className="skip-link">Ga naar hoofdinhoud</a>`.
  - `main` landmark: `<main id="main-content" role="main">`.
  - Global `*:focus-visible` outline for keyboard users.

### 4.2 Components

- `VeilingDisplay`:
  - Uses semantic `role="list"`/`listitem` and real `<a>` links.
  - Images have descriptive `alt` text.
  - Cards offer keyboard activation (Enter/Space) and focus outline.

- `SearchBar` (`frontend/components/SearchBar.tsx`):
  - Adds `label="Zoeken"` and `inputProps={{ 'aria-label': 'Zoeken' }}`.

- `RequireAuth`:
  - When role is insufficient, shows a textual “Geen toegang” message instead of a confusing redirect.

### 4.3 Forms

- Login and register pages use MUI `TextField`, which already associates labels and inputs.
- You can add `aria-live="polite"` around error/success messages to make screen readers announce status changes.

### 4.4 Testing

- Run WAVE, Lighthouse, and (optionally) axe on:
  - Landing page.
  - Veiling list.
  - Dashboard/profile.
  - A protected page.

---

## 5. Visual Design & Motion (Framer Motion)

### 5.1 Design principles

- Keep the design **clean, light, and consistent** with the existing branding (greens, light background).
- Use motion **only** to:
  - Gently introduce content on page load (fade + short vertical offset).
  - Give small feedback on hover/press on key elements (e.g., cards, main CTA).
- Avoid:
  - Large continuous animations.
  - Over‑animated hover states on every element.

### 5.2 Landing page hero

- File: `frontend/app/landing/page.tsx`
  - Use `framer-motion` for a simple hero effect:
    - `<motion.main>` wrapping hero section: fade and slide up on mount.
    - Logo and title as separate `motion` elements with small delays.
    - CTA button with subtle `whileHover` / `whileTap` scale.

### 5.3 Cards and sections

- Veiling cards (`VeilingDisplay`):
  - Wrap each card in a `motion.div`:
    - `initial={{ opacity: 0, y: 8 }}`.
    - `animate={{ opacity: 1, y: 0 }}` with a small stagger by index.
    - `whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.99 }}`.
  - Keep layout and borders controlled by MUI `Box` so styling stays consistent.

- Protected/static pages:
  - Use a shared pattern for page sections:
    - `<motion.section>` with a short fade/slide on mount.
    - This gives a consistent “app feel” without clutter.

---

## 6. Suggested Re‑Implementation Order

1. **Backend auth & roles**
   - Add `Role` column + migration.
   - Implement Argon2id hashing and verification.
   - Add cookie auth configuration.
   - Implement `/login`, `/me`, `/logout` as described.

2. **Frontend auth foundation**
   - Create `types/user.ts`.
   - Implement `authService.ts` (`login`, `logout`, `getCurrentUser`).
   - Implement `AuthProvider` and wrap `layout.tsx`.
   - Implement `RequireAuth` and `middleware.ts`.

3. **Navigation and pages**
   - Implement `AppNavbar` to show login/profile/admin links based on `user.role`.
   - Add scaffold pages for profile, dashboard, bids, watchlist, selling, admin, and static pages.

4. **Veiling UX**
   - Ensure `VeilingDisplay` uses semantic lists and accessible links.
   - Polish veiling detail page with consistent layout.

5. **Accessibility & motion**
   - Add skip link, main landmark, focus styles.
   - Add a minimal set of Framer Motion effects (hero, cards, sections).
   - Run WAVE/Lighthouse and tweak as needed.

---

This plan is meant as a **conceptual target**, not a description of the current code state. You can use it to rebuild a cleaner version of the auth, roles, navigation, accessibility, and design that still matches the original vision without inheriting any messy experiments from this session.

