## ADDED Requirements

### Requirement: Convex types generated during Docker build
The Docker build stage SHALL generate `src/convex/_generated/` from the local schema before running `vite build`, without requiring a running Convex backend.

#### Scenario: Clean build succeeds with generated types
- **WHEN** `docker build` runs from a checkout that does not contain `src/convex/_generated/`
- **THEN** the build stage generates the `_generated` directory and `vite build` completes successfully

#### Scenario: Codegen uses self-hosted mode
- **WHEN** the build stage runs `npx convex codegen`
- **THEN** `CONVEX_SELF_HOSTED_URL` is set so the CLI does not require `CONVEX_DEPLOYMENT`

### Requirement: Generated types excluded from version control
The repository SHALL NOT track `src/convex/_generated/` in git.

#### Scenario: Generated directory is gitignored
- **WHEN** `src/convex/_generated/` exists locally
- **THEN** `git status` does not list those files as tracked or untracked
