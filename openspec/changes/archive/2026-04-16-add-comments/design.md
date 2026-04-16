## Context

The application already provides an authenticated, realtime shared image gallery and a modal for viewing a selected image. Users also already have persisted identities and stable display colors in Convex-backed user records. The new change extends the image detail modal into a lightweight collaborative annotation surface without introducing a full drawing or editing system.

This design needs to coordinate frontend interaction state, realtime Convex subscriptions, a new persisted comment model, and dynamic author resolution. The repository currently has no generated tooltip/popover primitives and no existing annotation library, so the approach should stay close to the current Svelte + Tailwind + Convex stack.

## Goals / Non-Goals

**Goals:**
- Let authenticated users click directly on the displayed image to create a positioned comment draft.
- Persist comments with realtime fanout so all signed-in viewers of the same image see new comment markers immediately.
- Reuse the existing user identity and color system so popups show current author metadata instead of a historical snapshot.
- Keep the interaction lightweight: one draft at a time, one pinned popup at a time, and predictable dismissal behavior.
- Preserve correct marker placement as the image resizes within the modal.

**Non-Goals:**
- Freehand drawing, arrows, rectangles, or other rich annotation tools.
- Comment editing, deleting, threading, reactions, or unread state.
- Mobile-specific touch optimizations beyond basic click/tap support.
- A reusable global popup framework for the entire application.

## Decisions

### Use a DOM overlay anchored to the rendered image instead of canvas
- **Decision:** Render the image inside a positioned stage element and layer comment markers plus anchored popup UI above it using standard DOM elements.
- **Rationale:** This feature is interaction-heavy rather than paint-heavy. Native DOM elements handle focus, keyboard events, buttons, hover, and text input naturally, while canvas would require custom hit-testing and separate HTML overlays for the draft editor and popups.
- **Alternatives considered:**
  - **Canvas overlay:** Rejected because marker and popup interactions would become more complex than the visual benefits justify.
  - **Third-party annotation library:** Rejected because the app-specific workflow, Convex integration, and small scope would likely require substantial adaptation.

### Store marker positions as normalized image coordinates
- **Decision:** Persist each comment with `x` and `y` coordinates normalized to the displayed image content area, expressed as values between 0 and 1.
- **Rationale:** The image detail modal scales responsively. Normalized coordinates preserve comment placement across different viewport sizes and avoid coupling persisted data to a specific rendered pixel size.
- **Alternatives considered:**
  - **Raw pixel coordinates:** Rejected because comments would drift when the image size changes.

### Resolve author metadata dynamically from the users table
- **Decision:** Persist a stable author reference on each comment, then join that reference to the current user record in the comment query so the UI receives current author name and current color token/value.
- **Rationale:** The application already treats user identity and color as persistent user-level state. Dynamic resolution keeps comments aligned with the latest user profile data and avoids duplicating author fields on every comment.
- **Alternatives considered:**
  - **Snapshot author name/color onto each comment:** Rejected because it duplicates data and would not reflect later profile repairs or changes.

### Use the Clerk/Convex subject as the stable comment author key
- **Decision:** Persist the comment author by user subject rather than token identifier.
- **Rationale:** The existing `users` table indexes `subject` and treats it as the durable identity key, whereas token identifiers can rotate with auth sessions.
- **Alternatives considered:**
  - **Token identifier:** Rejected because it is less stable.
  - **Internal Convex user document ID only:** Possible, but subject better matches the existing identity flow and simplifies lookup when ensuring the current user.

### Model frontend UI with explicit draft, preview, and pinned states
- **Decision:** The image detail experience will treat the comment layer as a small state machine with mutually exclusive high-level states: no overlay, draft open, preview popup open, or pinned popup open.
- **Rationale:** The user experience is driven by clear rules: only one draft may exist, existing drafts should flash and refocus on repeated image clicks, hover previews should not silently override a pinned popup, and opening a different pinned popup should replace the previous one.
- **Alternatives considered:**
  - **Ad hoc booleans for each mode:** Rejected because interaction edge cases become harder to reason about and test.

### Keep popup placement anchored to the click or marker while allowing visual flipping
- **Decision:** Treat the exact marker location as the anchor point, but allow the popup or draft card to offset or flip so it remains visible within the modal viewport.
- **Rationale:** The user requirement is precision of anchor location, not literal rendering of the popup box centered on the same pixel even when that would clip outside the modal.

## Risks / Trade-offs

- **[Marker alignment can drift if measurements are taken from the wrong box]** → Measure against the actual rendered image stage rather than the outer modal container, and update positions from the same source of truth used for rendering.
- **[Dynamic author resolution makes historical comments reflect current user name/color rather than original values]** → Accept this as an intentional product trade-off and rely on the stable user identity model.
- **[Hover and pinned popup interactions can feel jarring]** → Give pinned state precedence over passive hover and limit the UI to a single active popup at a time.
- **[Near-edge clicks can produce awkward popup placement]** → Use anchored placement with directional flipping or offset logic so the pointer remains correct even when the popup body shifts.
- **[Realtime subscriptions can increase client complexity inside the modal]** → Scope the subscription to the currently selected image only and tear it down when the modal closes.

## Migration Plan

1. Add a new Convex table for image comments plus any needed indexes for image-scoped queries and author lookups.
2. Add comment query and create-mutation endpoints, reusing existing auth enforcement patterns.
3. Extend the image detail UI to subscribe to comments for the selected image and render the overlay state machine.
4. Release with no data migration required for existing images because comments are additive and optional.

Rollback strategy: disable the new UI and remove comment queries from the modal. Existing comment data can remain dormant in Convex without affecting the prior gallery functionality.

## Open Questions

- Should pressing Enter always submit, with Shift+Enter unsupported because comments are capped at 100 characters and intended to stay single-line?
- Should tapping a marker on touch devices immediately pin the popup with no hover-preview analogue?
