# AGENTS.md

## Purpose

This file is for coding agents working in this repository.
Follow the current codebase shape first, then extend it carefully.

## Repository summary

- App: `Collaborative Comments`
- Frontend: SvelteKit + Svelte 5 + TypeScript
- Styling: Tailwind CSS v4
- UI foundation: shadcn-svelte conventions
- Icons: `lucide-svelte`
- Backend: self-hosted Convex
- Auth: Clerk browser SDK bridged into Convex auth
- Adapter: `@sveltejs/adapter-node`

## Rules files discovered

- No root `AGENTS.md` existed at the time this file was created.
- No `.cursor/rules/` directory was found.
- No `.cursorrules` file was found.
- No `.github/copilot-instructions.md` file was found.

If any of the above are added later, treat them as additional instructions.

## Important commands

Examples below use `npm` because the root project has `package.json` and no root lockfile was found.

### Install

```bash
npm install
```

### Local development

```bash
npm run dev
```

### Verification environment

When you need to verify application changes locally, prefer the containerized workflow instead of starting the app directly with `npm run dev`.

Use:

```bash
docker compose up -d --build
```

This should be the default approach for local verification unless the user explicitly asks for a different workflow.

### Build

```bash
npm run build
```

Runs:

```bash
svelte-kit sync && vite build
```

### Preview production build

```bash
npm run preview
```

### Lint / typecheck / framework validation

There is no dedicated ESLint or Prettier script in the root project today.
Use the Svelte/TypeScript validation command instead:

```bash
npm run check
```

Runs:

```bash
svelte-kit sync && svelte-check --tsconfig ./tsconfig.json
```

### Tests

There is currently **no root test runner configured**.

- No `test` script exists in `package.json`
- No Vitest/Jest config was found at the root
- No app test files were found under `src/` or `tests/`

### Single-test execution

Single-test execution is **not available yet** because no test framework is configured.

Do **not** invent commands like these unless a test runner is added:

```bash
npm test
npm run test -- some-file
vitest path/to/test
```

If a test framework is introduced later, update this file with the exact project command for running one test.

### Convex

Start Convex local workflow:

```bash
npm run convex:dev
```

Deploy Convex functions/config:

```bash
npm run convex:deploy
```

Note: this repo is set to use Convex functions from `src/convex` via `convex.json`.

## Project structure

```text
src/
  convex/                 Convex server config and future backend functions
  lib/
    auth/                 Clerk bootstrap and auth store
    convex/               Browser Convex client singleton
    components/
      ui/                 shadcn-style primitives
      atoms/              smallest app-owned presentational units
      molecules/          composed small UI blocks
      organisms/          larger composed sections
      templates/          route-level composition shells
    features/             feature/domain-specific UI and orchestration
  routes/                 SvelteKit route entry points
```

## Architecture guidance

Prefer the existing **atomic design** structure for frontend work.

### Use these boundaries

- `src/lib/components/ui`: generator-friendly shadcn-style primitives only
- `src/lib/components/atoms`: tiny app-owned presentational pieces
- `src/lib/components/molecules`: small composed UI blocks
- `src/lib/components/organisms`: larger page sections
- `src/lib/components/templates`: route/page shells and layout composition
- `src/lib/features/*`: feature-specific stateful UI and orchestration

### Dependency direction

- `features/*` may depend on shared component layers
- shared component layers should **not** depend on `features/*`
- `ui` components should stay generic and reusable
- avoid putting product/domain wording or data loading inside `ui`

## Stack-specific guidance

### Svelte

- Use Svelte 5 patterns already present in the repo
- Prefer runes-style APIs like `$props()` and `$derived()` when extending existing components
- Use `<script lang="ts">`
- Keep route components thin; push reusable UI into `lib/`
- Guard browser-only setup with `browser` from `$app/environment`

### Convex

- Browser client setup belongs in `src/lib/convex`
- Auth-to-Convex bridging belongs in `src/lib/auth`
- Backend config and future functions belong in `src/convex`
- Do not place frontend-only code in `src/convex`
- Use public env vars in the frontend and server env access in Convex/server code

### shadcn-svelte

- Keep `src/lib/components/ui` compatible with shadcn-svelte conventions
- Prefer composable primitives and utility-based styling
- Reuse `cn()` from `$lib/utils` for class merging
- Avoid embedding feature workflows into base UI primitives

### TanStack Table

- TanStack Table is part of the intended stack for tabular UI
- When adding tables, keep table state/configuration in feature modules
- Keep reusable table presentation pieces generic when they belong in shared components
- Do not build custom ad hoc table state if TanStack Table can own it cleanly

### Icons

- Prefer `lucide-svelte` for icons
- Match existing icon usage: import named icons directly into the component that needs them
- Keep icon sizing in classes close to usage

## Code style conventions inferred from the codebase

### Formatting

- Follow the existing formatting style in the repo
- Use **tabs** for indentation in TS/Svelte files
- Use **single quotes**
- Keep **semicolons**
- Prefer trailing commas only when the surrounding style already uses them
- Keep long class strings readable; break lines when needed

### Imports

- Prefer `$lib/...` aliases instead of long relative paths when applicable
- Use `$app/...` and `$env/...` aliases in SvelteKit code
- Group imports simply and keep them stable
- Import types with `import type` when only the type is needed
- Keep component imports PascalCase and file paths kebab-case

### Naming

- Svelte component filenames: `kebab-case.svelte`
- Imported component symbols: `PascalCase`
- Utility functions: `camelCase`
- Stores/constants/types: follow existing TS naming conventions
- Route files follow SvelteKit conventions like `+page.svelte` and `+layout.svelte`
- Use descriptive names over abbreviations unless the abbreviation is already standard

### Types

- `tsconfig.json` has `strict: true`; preserve strict typing
- Add explicit types for non-trivial objects, stores, and function contracts
- Keep small local types near their usage when they are not shared
- Prefer narrow unions for UI state, as seen in `AuthState`
- Avoid `any`

### Error handling

- Prefer safe, user-facing fallback messages
- Follow the existing pattern:

```ts
error instanceof Error ? error.message : 'Fallback message'
```

- Fail gracefully when env/config is missing
- For browser-only services, return `null` or a safe fallback when not available
- Do not silently swallow important state transitions

### State and side effects

- Keep stores focused and explicit
- Centralize auth orchestration in auth-specific modules
- Initialize browser-only services in guarded lifecycle code
- Avoid duplicating singleton setup logic for Clerk or Convex clients

## UI and product guardrails

- Respect the scaffold's current scope: auth shell first, product logic later
- Do not casually introduce uploads, comments, moderation, or workflow logic unless the task requires it
- Keep authenticated shell/template components layout-oriented and thin
- Reuse `Panel`, `Button`, and other shared primitives before adding one-off wrappers

## When adding new frontend work

1. Decide whether it belongs in `ui`, `atoms`, `molecules`, `organisms`, `templates`, or `features`
2. Reuse shadcn-style primitives where possible
3. Use `lucide-svelte` for icons
4. Keep table-heavy UI aligned with TanStack Table patterns
5. Keep Convex access and auth bridging in their existing layers
6. Run `npm run check` after meaningful TypeScript/Svelte changes

## Verification guidance for agents

- For local app verification, prefer `docker compose up -d --build`
- Do not default to running the app directly with `npm run dev` for verification
- Only use a different verification workflow when the user explicitly requests it

## When updating this file

Update this file whenever any of the following change:

- test framework or single-test command
- lint/format tooling
- Cursor or Copilot instruction files
- component architecture rules
- package manager conventions
