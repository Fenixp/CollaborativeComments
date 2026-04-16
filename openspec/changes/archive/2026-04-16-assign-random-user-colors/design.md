## Context

The current frontend auth store derives user details directly from Clerk and uses Convex authentication for protected data access, but the application schema does not yet persist an app-owned user record with product-specific profile fields. This change introduces the first stable product identity attribute beyond the upstream auth provider: a fixed display color that collaborative image experiences can use to visually distinguish users.

The color must be assigned randomly, come from a bright/high-contrast palette, remain stable for each user after assignment, and not require global uniqueness. Because the value becomes part of the application data contract, the assignment logic should live on the trusted backend instead of the browser.

## Goals / Non-Goals

**Goals:**
- Persist a fixed display color for each registered application user.
- Assign the color automatically during first-time user creation or the first bootstrap that discovers a user record without a color.
- Use a curated palette of bright, contrasting colors that is safe for shared collaborative UI.
- Expose the persisted color through the application user record so later image-oriented UI can consume it.

**Non-Goals:**
- Guarantee globally unique colors across all users.
- Build the downstream UI that renders the new color in gallery, comments, or avatar treatments.
- Add user-managed profile color selection or admin tooling for color overrides.
- Introduce complex color-accessibility personalization beyond choosing a strong default palette.

## Decisions

### 1. Add an app-owned `users` table with a persisted `color` field
The backend should persist application users in a dedicated Convex table that can hold product-specific attributes such as a fixed display color.

**Why:** The frontend-only Clerk summary is not authoritative and cannot safely assign a stable random value. An app-owned user record creates a durable source of truth for future collaborative metadata.

**Alternatives considered:**
- **Keep color only in client state:** rejected because the value would change across sessions and devices.
- **Store color only in Clerk metadata:** rejected because the app should own product-specific collaboration fields inside its own data model.

### 2. Perform color assignment server-side from a curated constant palette
The system should define a small server-owned palette of bright, contrasting colors and randomly select one palette token when creating or repairing a user record. User records should persist the token name rather than a resolved hex value, and the application should resolve tokens through a centralized mapping.

**Why:** Server-side assignment ensures the rule is enforced consistently, prevents clients from inventing arbitrary values, and keeps the palette easy to audit and evolve. Storing the token name instead of the raw hex value makes future theming and palette refinement easier without rewriting every user record.

**Alternatives considered:**
- **Generate arbitrary colors algorithmically:** rejected because random RGB/HSL generation can produce muddy or low-contrast values.
- **Let the browser choose a color and submit it:** rejected because persistence rules should not depend on client trust or duplicated logic.
- **Store raw hex values on the user record:** rejected because token-based storage better supports future theme remapping while still preserving stable user identity.

### 3. Make color assignment write-once for normal operation
Once a user has a color, future sign-ins and bootstrap flows should preserve it unchanged. Only records missing a color should receive a newly assigned palette value.

**Why:** The product needs a stable visual identity marker; re-randomizing on each session would defeat the purpose.

**Alternatives considered:**
- **Reassign on every sign-in:** rejected because users would lose recognition across sessions.
- **Derive color deterministically from user id:** rejected because the request explicitly allows random assignment and a deterministic hash could cluster poorly around less legible colors unless heavily tuned.

### 4. Handle existing authenticated users with lazy backfill behavior
If older user records exist before the color field ships, the bootstrap path should assign a palette color the next time those users are encountered.

**Why:** This avoids requiring a separate one-off migration command for a small early-stage product while still ensuring every active user converges to the new contract.

**Alternatives considered:**
- **Require a hard migration before release:** rejected because the repository is early-stage and can safely backfill opportunistically.

## Risks / Trade-offs

- **Repeated colors can still create occasional ambiguity** → Accept this intentionally because uniqueness is out of scope; use the color as a lightweight aid rather than a sole identity key.
- **A poorly chosen palette could fail accessibility or contrast expectations in later UI** → Start with a curated set of saturated, high-contrast colors and keep the palette centralized for future refinement.
- **Introducing an app-owned users table increases auth/bootstrap complexity** → Keep the initial record shape minimal and limit bootstrap responsibilities to user upsert plus color assignment.
- **Legacy records without colors may persist if they never re-enter the bootstrap path** → Ensure the main authenticated user bootstrap flow repairs missing colors whenever such a record is encountered.

## Migration Plan

1. Add the new capability spec and the user-authentication spec delta describing stable per-user color assignment.
2. Extend the Convex schema with an application users table and a required persisted color field sourced from the curated palette.
3. Add or update authenticated user bootstrap logic so first-time users are created with a random palette color and existing colorless users are repaired lazily.
4. Expose the color through the application user contract for future collaborative image UI consumption.

Rollback strategy: stop reading the new field in application code and revert the user bootstrap/schema changes. Existing stored color values can remain inert if rollback happens after deployment.

## Open Questions

- None at this time.
