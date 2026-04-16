## Context

This change creates only the initial scaffold for a collaborative image commenting application. The system must use self-hosted Convex rather than Convex Cloud, must support a basic login experience, and must run as a Docker Compose stack suitable for hobby-scale hosting on paid infrastructure.

The frontend will use SvelteKit with shadcn-svelte components and Lucide icons. The frontend structure must follow a healthy but enforced atomic design approach: generated shadcn primitives remain in a dedicated `ui` layer, while app-specific atoms, molecules, organisms, and templates are built above that layer. This change stops at the application shell: login screen, authenticated empty index page, Convex integration baseline, and deployment scaffolding.

The stack has several constraints that shape the design:

- Convex is self-hosted, so backend deployment, dashboard, persistence, and environment management belong to the application stack.
- Authentication may be externally hosted, and the preferred path is the lowest-friction implementation path rather than full self-hosting.
- `convex-svelte` supports Svelte subscriptions and client access, but Convex's polished auth wrappers are React-oriented, so SvelteKit will need a thin custom auth-to-Convex integration layer.
- The initial scaffold should avoid product business logic such as uploads, comments, threads, or moderation.

## Goals / Non-Goals

**Goals:**
- Establish a production-oriented baseline architecture for a self-hosted SvelteKit + Convex application running in Docker Compose.
- Support authenticated access with externally hosted account management and Convex-compatible JWT validation.
- Provide an authenticated shell view after login and an unauthenticated login screen before login.
- Define stable frontend conventions for atomic design, feature boundaries, and shadcn-svelte usage.
- Keep the initial scaffold simple enough to implement safely while leaving room for future expansion.

**Non-Goals:**
- Image upload workflows, image metadata business rules, or review-domain persistence.
- Anchored comments, realtime comment overlays, and comment authorization rules.
- Threaded conversations, replies, mentions, reactions, or notifications.
- Multi-workspace collaboration, organization models, or granular role hierarchies beyond simple shell-level authentication behavior.
- Full production hardening for scale beyond hobby-grade deployment.
- A completely self-hosted authentication provider.

## Decisions

### 1. Use self-hosted Convex with Docker Compose and start with the default persistence model

The system will run Convex backend and Convex dashboard as first-class services in Docker Compose, alongside the SvelteKit frontend and a reverse proxy. The initial persistence strategy will favor the simplest supported self-hosted setup, using the default local persistent volume model before introducing separate Postgres or S3-compatible services.

**Why:** Self-hosted Convex is a hard requirement. Starting with the documented default setup minimizes infrastructure complexity and aligns with hobby-scale hosting goals.

**Alternatives considered:**
- **Convex Cloud:** Rejected because self-hosting is a requirement.
- **Postgres and object storage from day one:** Rejected for the initial change because it adds operational overhead without clear first-version benefit.

### 2. Use SvelteKit with `adapter-node` as the frontend runtime

The frontend will be a Node-served SvelteKit app packaged into a container and run behind a reverse proxy. This preserves SSR capability, straightforward environment variable handling, and compatibility with container hosting.

**Why:** `adapter-node` is the natural fit for Docker-hosted SvelteKit applications and avoids premature constraints from static export strategies.

**Alternatives considered:**
- **Static adapter:** Rejected because the app benefits from a server-capable runtime and may need SSR-aware auth flows and proxy-aware configuration.
- **SPA-only architecture:** Rejected because it unnecessarily narrows future flexibility.

### 3. Use Clerk as the external authentication and account-management provider

Authentication and account management will be delegated to Clerk, while Convex validates Clerk-issued JWTs via `auth.config.ts`. The frontend will integrate Clerk for sign-in, sign-out, and account-management UI, and Convex will use authenticated identity data to authorize operations and persist application users.

**Why:** Clerk offers the lowest-friction path for hosted login, session management, and account management while still fitting Convex's JWT-based auth model.

**Alternatives considered:**
- **Convex Auth:** Rejected because the self-hosted Convex path is less straightforward.
- **Auth0:** Viable, but not preferred because Clerk better fits the need for fast account-management setup.
- **Self-hosted IdP (e.g. Keycloak/Authentik):** Rejected as too operationally heavy for a hobby-scale initial version.

### 4. Add a thin Svelte auth bridge for Convex rather than forcing a React-centric pattern

The frontend will use `convex-svelte` for subscriptions and client access, with a small integration layer responsible for obtaining a Clerk JWT and setting Convex auth credentials on the client. This bridge will also expose authenticated state suitable for route/layout gating in SvelteKit.

**Why:** Svelte is the chosen frontend framework, and the available Convex auth examples are centered on React providers. A dedicated Svelte bridge keeps the architecture explicit and framework-appropriate.

**Alternatives considered:**
- **Adapting React-specific Convex auth wrappers:** Rejected because it introduces awkward cross-framework coupling.
- **Skipping provider integration and manually attaching tokens ad hoc:** Rejected because it would scatter auth concerns across the UI.

### 5. Keep frontend structure strict but layered: `ui` primitives below atomic design, features beside it

Generated shadcn-svelte components will remain in `$lib/components/ui`. App-owned design-system components will live in `$lib/components/atoms`, `molecules`, `organisms`, and `templates`. Domain-specific logic and feature assemblies will live in `$lib/features/*`.

**Why:** This preserves shadcn upgradeability while enforcing a clear and teachable component structure.

**Alternatives considered:**
- **Move all shadcn files into atomic folders:** Rejected because it fights the generator and blurs primitive versus app-specific ownership.
- **Feature-only organization with no atomic structure:** Rejected because atomic design is an explicit project requirement.

### 6. Defer application domain modeling until after scaffold completion

This change will not define image, comment, or domain-specific business models beyond what is strictly needed to initialize Convex successfully. The focus is on project structure and auth-capable shell behavior.

**Why:** The user explicitly wants setup and skeleton work only, with business logic deferred.

**Alternatives considered:**
- **Include image and comment schema now:** Rejected because it would mix application design with scaffold-only work.
- **Persist application users immediately:** Deferred unless required by the chosen auth shell implementation.

## Risks / Trade-offs

- **Svelte auth integration requires custom work** → Mitigate by isolating the Clerk-to-Convex bridge in a dedicated auth layer and keeping the API small.
- **Self-hosted Convex adds operational complexity** → Mitigate by adopting the official self-hosted Docker topology first and deferring extra services until needed.
- **Local-first storage choices may need later migration** → Mitigate by keeping storage and persistence decisions explicit in configuration and avoiding assumptions that prevent later Postgres/S3 migration.
- **Auth integration may tempt us into early business logic** → Mitigate by limiting this change to login/logout/shell states and deferring user-domain persistence unless technically necessary.
- **Strict structure may slow early implementation if over-applied** → Mitigate by enforcing only the agreed layer boundaries instead of inventing unnecessary sub-taxonomies.

## Migration Plan

1. Scaffold the SvelteKit application and Convex project structure together so the repository has a single coherent baseline.
2. Stand up the Docker Compose stack for frontend, self-hosted Convex backend, Convex dashboard, and reverse proxy-aware configuration.
3. Integrate Clerk and Convex auth validation for login/logout and authenticated shell routing.
4. Add an unauthenticated login screen and an authenticated empty index page.
5. Verify the app can be brought up entirely from Docker Compose with required environment variables.

Rollback can occur at the container deployment level by reverting to the previous image set and environment configuration. Because this is an initial project bootstrap change, rollback risk is primarily about startup failure rather than data migration incompatibility.

## Open Questions

- Is local persistent storage sufficient for the first hosted deployment, or should object storage be introduced before launch?
- What exact Clerk UX surface should be exposed in the app for account management: hosted account portal only, embedded user button/menu, or custom settings pages later?
