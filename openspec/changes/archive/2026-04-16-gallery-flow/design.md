## Context

The current application has a polished authentication flow, authenticated account controls, and an intentionally empty signed-in landing page. There are no product-facing Convex functions yet, no image data model, and no reusable dialog or gallery primitives in the component library. The next increment introduces the first shared product workflow: authenticated users upload images, the system stores image metadata and binary content, and all signed-in users see committed uploads appear in real time.

This design must fit the existing SvelteKit + Svelte 5 + Convex architecture, keep the account header intact, and create a backend-first contract that supports later paging, filtering, sorting, rename, and delete work without redesigning the upload model.

## Goals / Non-Goals

**Goals:**
- Add a shared authenticated gallery at the root signed-in experience.
- Define an image data model and upload lifecycle that only exposes fully committed images in the shared grid.
- Enforce image-only uploads, a 2 MB size limit, and backend-backed duplicate-name handling.
- Keep the gallery live through Convex realtime queries so successful uploads from any user appear without refresh.
- Clean up partial storage or metadata artifacts when upload finalization fails.
- Provide resilient thumbnail rendering with a branded fallback image.

**Non-Goals:**
- Paging, sorting controls, filtering, search, rename, and delete UI.
- Image compression, resizing, or derivative generation.
- Role-based permissions or private-per-user galleries.
- Surfacing in-progress uploads as shared gallery items.
- Broad refactoring of the authentication system beyond updating the authenticated root experience.

## Decisions

### 1. Model images as metadata records with explicit upload state
The system will create a dedicated image record that includes user-facing name, normalized name, storage reference, uploader identity, timestamps, file metadata, and a state field. The state exists to represent backend workflow progress, but the shared gallery query will only return records whose state is fully committed (for example, `ready`).

**Why:** This separates backend workflow truth from user-facing visibility and allows uploads to be staged, finalized, and cleaned up without exposing incomplete items to other users.

**Alternatives considered:**
- **Only create records once upload is complete:** simpler shape, but gives less explicit backend lifecycle information and makes compensating cleanup harder to reason about.
- **Show pending items in the shared grid:** rejected because it would expose half-finished uploads, fallback thumbnails, and temporary naming transitions to all users.

### 2. Keep local upload progress separate from the shared realtime grid
Uploading or failed items will be tracked in the uploading client’s local UI state, not in the shared gallery query. The Convex gallery query remains live during uploads and continues to show newly committed images from all users in newest-first order.

**Why:** This preserves a clean shared grid while still allowing the uploading user to see progress and concurrent updates from other users.

**Alternatives considered:**
- **Represent pending uploads as grid cards:** rejected because the grid should only reflect committed content.
- **Pause gallery updates during upload:** rejected because the user explicitly wants the gallery to stay live while uploads happen.

### 3. Enforce upload constraints in both frontend and backend
The upload modal will reject invalid MIME types and files over 2 MB before upload begins, but backend functions will repeat those checks authoritatively before finalizing records.

**Why:** Fast client feedback improves usability, while backend enforcement protects correctness for races, bypassed clients, and future API consumers.

**Alternatives considered:**
- **Frontend-only validation:** insufficient once clients are bypassed or future paging/API usage expands.
- **Backend-only validation:** correct but too slow and frustrating for obvious invalid files.

### 4. Resolve duplicate names silently by appending a short GUID suffix
Users can edit the proposed image name during upload. If the final normalized name collides with an existing committed or in-flight image, the backend will silently generate a unique short GUID suffix before the extension and persist that resolved name.

**Why:** This avoids cross-user upload races causing failures, keeps the flow simple, and avoids adding rename interactions to the first slice.

**Alternatives considered:**
- **Hard reject duplicates:** rejected because the user asked for automatic resolution.
- **Numeric suffixes such as `(2)`:** rejected in favor of short GUID suffixing because GUIDs avoid “find the next number” race handling.

### 5. Use compensation cleanup for partial failures
The upload flow will be treated as a multi-step operation: validate, create/upload storage artifact, finalize metadata, and publish committed records. If any later step fails after earlier persistence succeeds, the system must delete the existing storage object and/or non-ready metadata record so no orphaned artifacts remain.

**Why:** The product requirement is binary: successful uploads exist, failed uploads do not.

**Alternatives considered:**
- **Best-effort cleanup only:** rejected because orphaned files or records would undermine correctness.
- **Allow failed records to remain for inspection:** rejected because only fully uploaded images should exist in the visible product dataset.

### 6. Use branded fallback presentation when thumbnails cannot render
Committed gallery items will attempt to render their stored image preview. If the thumbnail URL is missing or the image fails to render, the frontend will show a branded fallback image instead of a broken element.

**Why:** This keeps the gallery visually stable and on-brand even if a storage URL cannot be rendered.

**Alternatives considered:**
- **Broken-image icon or empty box:** rejected because the user wants branded fallback behavior.

## Risks / Trade-offs

- **Compensating cleanup can fail independently** → Add explicit cleanup steps for both storage and metadata and surface failures so they can be retried or investigated.
- **Silent GUID-based renaming can surprise users** → Accept this as a deliberate trade-off for a smoother upload flow, while keeping the final resolved name visible in the gallery after completion.
- **Stateful records add lifecycle complexity** → Limit the workflow to a minimal set of states and keep the shared query filtered to fully committed images only.
- **Thumbnail rendering depends on storage URL resolution** → Use branded fallback rendering so gallery cards stay usable when image URLs are unavailable.
- **Future paging must not weaken uniqueness checks** → Keep duplicate resolution and validation entirely backend-backed rather than derived from the currently loaded gallery page.

## Migration Plan

1. Add new image capability specs and modify affected existing capability specs.
2. Introduce Convex schema and authenticated backend functions for image records, upload orchestration, gallery queries, and cleanup.
3. Replace the authenticated placeholder landing content with the new gallery feature while preserving the existing header/account controls.
4. Add local upload UI state and fallback thumbnail behavior.
5. Validate the feature manually in a local authenticated environment with multiple clients to confirm realtime gallery updates and cleanup behavior.

Rollback strategy: restore the authenticated placeholder shell, remove new gallery frontend wiring, and remove the new image backend/data artifacts together so no stale UI references remain.

## Open Questions

- Which exact storage primitive in the current self-hosted Convex setup should hold image binaries and return renderable URLs for thumbnails?
- What minimal backend state names will best support upload orchestration and cleanup without overcomplicating the model?
- What branded fallback asset should the frontend use, and where should it live so it remains available without a network round-trip failure loop?
