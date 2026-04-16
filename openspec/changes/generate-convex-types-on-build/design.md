## Context

The SvelteKit app imports from `src/convex/_generated/api.js` at build time. These files are produced by the Convex CLI from the local schema and function definitions. In cloud-hosted Convex they are regenerated automatically by `npx convex dev`; in this self-hosted setup they were gitignored, causing the Docker build to fail.

The current workaround commits the generated files to git, which introduces noise in diffs and risk of schema/type drift.

## Goals / Non-Goals

**Goals:**
- Generate `src/convex/_generated/` inside the Docker build container before `vite build` runs
- Require no running Convex backend during the image build
- Re-add `src/convex/_generated/` to `.gitignore`

**Non-Goals:**
- Changing how `convex-sync` deploys functions to the live backend (unchanged)
- Supporting cloud-hosted Convex deployments

## Decisions

### Use `npx convex codegen` with a dummy self-hosted URL

`npx convex codegen` reads the local schema and function files to emit TypeScript types — it does not call a backend API. However, the CLI requires either `CONVEX_DEPLOYMENT` (cloud) or `CONVEX_SELF_HOSTED_URL` (self-hosted) to be set or it exits with an error.

Setting `CONVEX_SELF_HOSTED_URL=http://localhost:3210` as a build-time env var satisfies the CLI check without any real network call during codegen.

**Alternatives considered:**
- *Commit generated files*: Simple but causes diff noise and type drift risk.
- *`npx convex dev --once`*: Requires a live backend; not viable at image build time.
- *Copy files in via CI before build*: Adds CI complexity for no benefit over local generation.

## Risks / Trade-offs

- [CLI behaviour change] A future Convex CLI version could make codegen require a real network call → Mitigation: pin the `convex` package version and test on upgrades.
- [Dummy URL side-effect] If codegen ever validates the URL format, `http://localhost:3210` is a valid URL and should continue to pass.

## Migration Plan

1. Add `ENV CONVEX_SELF_HOSTED_URL=http://localhost:3210` and `RUN npx convex codegen` to the Dockerfile build stage.
2. Remove `src/convex/_generated/` from git tracking (`git rm -r --cached`).
3. Re-add `src/convex/_generated/` to `.gitignore`.
4. Verify the Docker build succeeds end-to-end.
