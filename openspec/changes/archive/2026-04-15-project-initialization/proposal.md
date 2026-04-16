## Why

This change establishes the initial scaffold for a self-hosted collaborative image review application built on SvelteKit and Convex. The project needs a clean bootstrap now so future implementation can proceed from a stable foundation without mixing setup work with business logic.

## What Changes

- Create the initial application architecture for a self-hosted SvelteKit + Convex stack running through Docker Compose.
- Establish frontend initialization with Tailwind, shadcn-svelte, Lucide, and the agreed atomic-design-oriented folder structure.
- Introduce external authentication wiring sufficient to present a login screen and an authenticated empty index page.
- Prepare Convex project structure and self-hosted environment wiring without implementing product-specific business logic.

## Capabilities

### New Capabilities
- `project-scaffold`: Repository, frontend, Convex, and Docker Compose bootstrap for local and hosted development.
- `user-authentication`: Sign in, sign out, session handling, and account-entry UI for authenticated users.

### Modified Capabilities

None.

## Impact

- Affects the full application stack: SvelteKit frontend, self-hosted Convex backend, Convex dashboard, and Docker Compose deployment.
- Introduces authentication provider integration and Convex auth validation only to the extent required for a working shell experience.
- Establishes frontend architecture conventions for atomic design, shadcn-svelte component usage, and feature boundaries.
- Defers image upload, annotation comments, and other product business logic to later changes.
