## 1. Project foundation

- [x] 1.1 Scaffold the SvelteKit application with TypeScript, Tailwind, and Node adapter support.
- [x] 1.2 Initialize shadcn-svelte and Lucide dependencies and establish the `ui`, atomic-design, and feature directory conventions.
- [x] 1.3 Initialize Convex for SvelteKit with functions located under `src/convex` and baseline project configuration.

## 2. Self-hosted infrastructure

- [x] 2.1 Add Docker Compose services for the SvelteKit frontend, self-hosted Convex backend, and Convex dashboard.
- [x] 2.2 Add reverse-proxy-friendly runtime configuration, persistent volumes, and environment variable templates for local and hosted use.
- [x] 2.3 Document the expected startup flow and required secrets for self-hosted Convex and external auth integration.

## 3. Authentication and user persistence

- [x] 3.1 Integrate Clerk into SvelteKit for sign-in, sign-out, and account-management entry points.
- [x] 3.2 Configure Convex auth validation for Clerk-issued tokens in the self-hosted environment.
- [x] 3.3 Implement the Svelte auth bridge that obtains provider tokens and applies authenticated state to the Convex client.
- [x] 3.4 Build the unauthenticated login screen and the authenticated empty index page shell.

## 4. Scope safeguards and documentation

- [x] 4.1 Document the intended directory structure and layer boundaries for `ui`, atomic design components, and features.
- [x] 4.2 Document the required environment variables and startup flow for the scaffolded stack.
- [x] 4.3 Verify that no image-upload, comment, or other product business logic is introduced in this change.

## 5. Integration hardening

- [x] 5.1 Wire authenticated route gating and unauthenticated fallbacks across shell routes.
- [x] 5.2 Validate that the full scaffold can be started through Docker Compose with the documented configuration.
- [x] 5.3 Confirm the resulting application state is limited to login screen and authenticated empty index page behavior.
