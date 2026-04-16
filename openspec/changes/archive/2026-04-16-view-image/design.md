## Context

The current gallery experience already includes a custom upload modal implemented directly in `gallery-experience.svelte`, while the gallery grid and image cards remain presentational. Images are rendered from the existing gallery data contract and displayed in square cards with graceful fallback behavior, but there is no mechanism to inspect a selected image beyond its thumbnail-sized presentation.

This change should extend the gallery UI without introducing backend or storage work. It also needs to stay visually and behaviorally aligned with the existing modal pattern already used by the application so the new detail view feels native instead of bolted on.

## Goals / Non-Goals

**Goals:**
- Let users open an existing gallery image in a detail modal from the gallery UI.
- Show the selected image as large as the viewport allows while preserving aspect ratio.
- Reuse the same modal interaction language already present in the app: backdrop, Escape, explicit close button, and action-row dismissal.
- Keep modal ownership in the gallery experience and keep grid/card layers focused on selection and display.

**Non-Goals:**
- Changing gallery backend contracts, storage behavior, or image processing.
- Adding zoom, pan, slideshow, keyboard image navigation, or download interactions.
- Replacing the existing upload modal abstraction with a generic dialog system.

## Decisions

### 1. Keep detail-modal state in `gallery-experience.svelte`
The gallery experience will own the selected-image state and render the detail modal alongside the existing upload modal logic.

**Why:** The route-level gallery component already manages modal rendering, Escape handling, and backdrop dismissal for upload. Reusing that ownership pattern keeps state centralized and avoids pushing workflow state into presentational child components.

**Alternatives considered:**
- **Put modal state in `gallery-grid.svelte`:** rejected because the grid should remain a rendering layer, not a workflow owner.
- **Put modal state inside each card:** rejected because it would duplicate dialog logic across repeated items and make shared dismissal handling harder.

### 2. Treat the grid and cards as selection emitters, not modal owners
Gallery cards should become interactive entry points that communicate which image was chosen, while the modal itself stays outside the repeated card structure.

**Why:** This preserves a clean component boundary: cards display image summaries, the grid lays them out, and the gallery experience handles application state.

The interactive trigger should also include a subtle hover affordance so users can tell the existing image is clickable before opening the detail modal.

**Alternatives considered:**
- **Render a modal inside each card:** rejected because repeated dialog markup is harder to manage and less consistent with the existing page-level modal pattern.

### 3. Match existing modal behavior but allow a larger presentation shell
The detail modal should inherit the existing modal interaction model—backdrop, top-right close affordance, Escape dismissal, and footer actions—but use a wider/taller content area than the upload form so the image can dominate the viewport.

**Why:** The user wants the image to fill as much of the screen as possible while still feeling like the same modal system already used in the app.

**Alternatives considered:**
- **Reuse the upload modal width exactly:** rejected because a form-sized dialog would artificially limit image viewing.
- **Create a full-bleed lightbox with no action row:** rejected because the user explicitly wants both a close button and an OK button.

### 4. Make Close and OK equivalent dismissal actions
The detail modal will provide both a close control and an OK button, and both controls will dismiss the modal without side effects.

**Why:** The user explicitly confirmed that both affordances should produce the same outcome. This keeps the interaction simple and avoids inventing confirmation semantics where none are needed.

**Alternatives considered:**
- **Use only a close icon or backdrop dismissal:** rejected because the requested UI includes both controls.
- **Make OK confirm a separate action:** rejected because there is no secondary workflow to confirm.

## Risks / Trade-offs

- **Two modal flows in one component can increase local complexity** → Keep upload and detail modal state separate and use clearly named open/close handlers.
- **Interactive cards may need accessibility treatment beyond visual clickability** → Ensure the final implementation treats cards or image triggers as keyboard-accessible controls with appropriate labeling.
- **Hover feedback can become visually noisy if overdone** → Keep the affordance subtle and supportive rather than turning the gallery card into a dramatic animation target.
- **Large images can still exceed viewport dimensions** → Constrain the rendered image by viewport-aware container sizing and use contain-style fitting so aspect ratio remains intact.

## Migration Plan

1. Add the image-gallery spec delta for detail-modal behavior.
2. Extend gallery components so image selection events flow up to `gallery-experience.svelte`.
3. Add a detail modal in the gallery experience using the existing modal interaction pattern with a larger image-focused layout.
4. Verify that dismissal works consistently via close button, OK button, Escape, and backdrop click.

Rollback strategy: remove the new selection wiring and detail modal markup/state, restoring the gallery to static card browsing only.

## Open Questions

- Should the image name or metadata appear in the detail modal, or should the first version remain image-only plus dismissal controls?
