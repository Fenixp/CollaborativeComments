# Self-hosted stack guide

## Required secrets and environment values

### Frontend

- `PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key used by the browser SDK.
- `PUBLIC_APP_URL`: public browser URL for the SvelteKit shell.
- `PUBLIC_CONVEX_URL`: public browser URL for the Convex backend.
- `PUBLIC_CONVEX_SITE_URL`: public browser URL for Convex HTTP actions/site proxy.

### Convex backend

- `CONVEX_INSTANCE_SECRET`: long random even-length hex secret for the self-hosted backend instance.
- `CLERK_JWT_ISSUER_DOMAIN`: Clerk frontend API URL / issuer domain used by `src/convex/auth.config.ts`.

### Convex CLI / dashboard administration

- `CONVEX_SELF_HOSTED_URL`: backend URL used by the CLI.
- `CONVEX_SELF_HOSTED_ADMIN_KEY`: generated from the backend container after startup.

## Expected startup flow

1. Copy `.env.example` to `.env`.
2. Replace placeholder values for Clerk and Convex secrets.
3. Bring the stack up with Docker Compose.
4. Wait for the `backend` healthcheck to pass.
5. Generate an admin key:

   ```bash
   docker compose exec backend ./generate_admin_key.sh
   ```

6. Put the generated value into `CONVEX_SELF_HOSTED_ADMIN_KEY` for any local CLI usage.
7. If you need to sync Convex code or environment metadata, run the Convex CLI against the self-hosted URL using the two `CONVEX_SELF_HOSTED_*` variables.

## Reverse proxy notes

- Set `APP_ORIGIN` / `PUBLIC_APP_URL` to the public URL exposed by your proxy.
- Set `PUBLIC_CONVEX_URL` and `PUBLIC_CONVEX_SITE_URL` to the public backend URLs that browsers can reach.
- Set `DO_NOT_REQUIRE_SSL=false` when TLS termination is correctly configured upstream.
- Keep the Docker volume attached to `/convex/data` so SQLite persistence survives container restarts.

## Authentication notes

- Enable Clerk's Convex integration so the `convex` JWT template is available.
- `src/convex/auth.config.ts` validates Clerk-issued JWTs with `CLERK_JWT_ISSUER_DOMAIN`.
- The Svelte auth bridge uses Clerk in the browser, fetches the `convex` JWT template, and applies it to the Convex client.

## Scope confirmation

This stack is intentionally limited to:

- login entry
- sign-out path
- account-management entry
- authenticated empty shell

No upload, comment, or other product-specific flows are introduced here.
