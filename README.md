# Collaborative Comments

Initial scaffold for a self-hosted collaborative image review application built with SvelteKit, Convex, Docker Compose, and Clerk.

This change intentionally stops at shell behavior:

- unauthenticated users see a login-focused screen
- authenticated users see an empty application shell
- Convex is configured for self-hosting and Clerk JWT validation
- no upload, comment, image, or other product business logic is included

## Stack

- **Frontend:** SvelteKit, TypeScript, Tailwind CSS v4, `adapter-node`
- **UI foundation:** shadcn-svelte conventions, Lucide icons
- **Backend:** self-hosted Convex with functions under `src/convex`
- **Authentication:** Clerk browser SDK + custom Svelte auth bridge for Convex
- **Infrastructure:** Docker Compose for frontend, Convex backend, Convex dashboard

## Directory structure

```text
src/
  convex/                 Convex configuration and future backend functions
  lib/
    auth/                 Clerk client and Svelte auth bridge
    convex/               Browser Convex client bootstrap
    components/
      ui/                 shadcn-style primitives that stay generator-friendly
      atoms/              Small app-owned visual building blocks
      molecules/          Small composed UI units built from atoms/ui
      organisms/          Larger composed sections
      templates/          Route-level layout shells
    features/
      auth/               Domain-specific auth UI and orchestration
  routes/
    +layout.svelte        Global frontend bootstrap for Convex + auth
    +page.svelte          Login shell or authenticated empty shell
    account/+page.svelte  Protected-style account route with unauth fallback
```

## Environment files

- Copy `.env.example` for local Docker usage.
- Copy `.env.hosted.example` when preparing a reverse-proxied or hosted deployment.

Minimum required values:

- `PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`
- `CONVEX_INSTANCE_SECRET` (must be an even-length hex string)

Optional but commonly required later:

- `CONVEX_SELF_HOSTED_ADMIN_KEY` for CLI sync and dashboard administration

## Startup flow

1. Copy `.env.example` to `.env` and replace the placeholder secrets.
2. Create a Clerk application and enable Clerk's Convex integration so the `convex` JWT template is available.
3. Start the stack with Docker Compose.
4. Generate an admin key from the running backend container.
5. Export `CONVEX_SELF_HOSTED_URL` and `CONVEX_SELF_HOSTED_ADMIN_KEY` locally when you want to run `convex dev` or `convex deploy`.
6. Open the frontend at `http://localhost:3000` and the dashboard at `http://localhost:6791`.

See `docs/self-hosting.md` for the detailed self-hosted workflow and `docs/architecture.md` for frontend layering rules.
