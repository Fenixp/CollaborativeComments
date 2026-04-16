## Why

The Docker build fails because `src/convex/_generated/` is gitignored but required at compile time. The current workaround of committing generated files is fragile — they can drift out of sync with the schema and pollute diffs on every schema change.

## What Changes

- Add a build step that generates Convex types inside the Docker build container before `npm run build` runs
- Configure the self-hosted Convex codegen to work without a live backend by pointing at the local schema
- Remove the generated files from git tracking once build-time generation is reliable

## Capabilities

### New Capabilities

- `convex-build-codegen`: Generates `src/convex/_generated/` inside the Docker build stage using the local schema, requiring no running Convex backend

### Modified Capabilities

<!-- none -->

## Impact

- `Dockerfile` — new build step before `npm run build`
- `src/convex/_generated/` — removed from git, regenerated on every Docker build
- `.gitignore` — re-add `src/convex/_generated/`
