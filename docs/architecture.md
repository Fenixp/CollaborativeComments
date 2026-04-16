# Frontend architecture

This scaffold keeps the UI layers explicit from the start so future work does not mix generated primitives, design-system components, and feature logic.

## Layer boundaries

### `src/lib/components/ui`

- Reserved for generator-friendly, low-level primitives following shadcn-svelte conventions.
- Prefer generic concerns only: buttons, panels, inputs, dialogs, and other reusable building blocks.
- Avoid feature logic, auth state, data loading, or product wording here.

### `src/lib/components/atoms`

- App-owned micro-components built on top of `ui` primitives or raw markup.
- Keep these small and presentation-focused.

### `src/lib/components/molecules`

- Compose atoms and `ui` primitives into small reusable assemblies.
- Example in this scaffold: the login card.

### `src/lib/components/organisms`

- Larger interface sections that organize multiple molecules or feature controls.
- Example in this scaffold: the authenticated shell header.

### `src/lib/components/templates`

- Route-level composition shells.
- Templates should remain layout-oriented and thin.

### `src/lib/features/*`

- Domain or vertical slices that own orchestration, stateful controls, and feature-specific UI.
- Feature folders may depend on shared component layers, but shared component layers should not depend on feature folders.

## Convex and auth boundaries

- `src/lib/auth` owns Clerk bootstrap and the Svelte auth bridge that applies Clerk tokens to the browser Convex client.
- `src/lib/convex` owns the browser client singleton.
- `src/convex` is reserved for backend configuration and future Convex functions only.

## Scope guardrails for this change

This scaffold deliberately excludes:

- image uploads
- image metadata or persistence
- comments or threads
- moderation or notification logic
- any other product-specific business behavior

Only shell states, auth wiring, and infrastructure setup belong in this change.
