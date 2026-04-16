## Context

The app uses SvelteKit + Convex (real-time backend) + Clerk auth. Convex provides reactive push queries via `client.onUpdate`, which is already used for comment syncing. Users have a pre-assigned `colorToken`/`colorValue` from the `user-identity-colors` system. The image detail modal renders an inline coordinate space (0–1 normalized x/y), which is the same space used for comment markers.

## Goals / Non-Goals

**Goals:**
- Broadcast cursor position to all users simultaneously viewing the same image
- Render remote cursors as small colored SVG arrows with white outline
- Smoothly animate cursor position updates (no jumping)
- Hide cursor when the user closes the modal; persist last position when mouse leaves image

**Non-Goals:**
- Showing the local user's own cursor
- Displaying user names on cursors
- Cursor presence outside the image overlay (e.g., in comments panel)
- Cursor history or replay

## Decisions

### D1: Use Convex `imageCursors` table for presence state

**Decision**: Store cursor positions in a new Convex table, written via mutation every 500ms while the modal is open and the mouse is over the image.

**Rationale**: Convex is already the real-time backbone. Adding a table avoids introducing a second real-time layer (e.g., WebSockets, Partykit). The query subscribes reactively via `client.onUpdate`, exactly as comments do.

**Alternative considered**: Client-side only via WebRTC/broadcast channel — ruled out because it wouldn't work across different devices/sessions and adds complexity.

### D2: Stale cursor detection via client-side `updatedAt` filter

**Decision**: The `listImageCursors` query returns all cursors where `isActive = true`. The client additionally hides cursors whose `updatedAt` is older than 2000ms (stale fallback for tab crashes / hard closes).

**Rationale**: Convex queries are deterministic and cannot call `Date.now()` server-side. Client-side filtering is simple and sufficient for this scale. A scheduled cleanup function would add infrastructure complexity for a minor edge case.

**Alternative considered**: Convex scheduled function to tombstone stale records — deferred as over-engineering for now.

### D3: Smooth animation via CSS transition timed to update interval

**Decision**: Apply `transition: left 500ms ease, top 500ms ease` to cursor elements. Since updates arrive every 500ms, the CSS transition completes just as the next update arrives, creating continuous smooth movement.

**Rationale**: No RAF loop or manual lerp needed. Purely declarative. Aligns perfectly with the 500ms write interval.

**Edge case**: On first mount, skip the transition for one frame (via a reactive flag) so the cursor appears immediately at its correct position rather than sliding in from 0,0.

### D4: Cursor SVG with `transform-origin` at the tip

**Decision**: The cursor is an inline SVG arrow pointer, filled with `user.colorValue` and stroked white (~1.5px). The SVG's visual tip maps to `left`/`top` CSS position so coordinates are intuitive — no centering offset needed.

**Rationale**: Matches OS cursor conventions. Avoids coordinate offset math that centered elements would require.

### D5: Track `mousemove` on the image element only

**Decision**: Attach `mousemove` to the same stage element used for click handling. Stop sending updates (but don't clear) when mouse leaves the image. Call `clearCursor` mutation only when modal closes.

**Rationale**: The stage element already has a `getBoundingClientRect()` pattern for comment anchor calculation. Reusing it keeps coordinate math consistent. Persisting the last position when mouse leaves matches the spec requirement.

## Risks / Trade-offs

- **Write volume**: 2 users × 2 writes/sec = ~4 writes/sec to Convex. Acceptable for a small collaborative tool; would need rethinking at scale.
- **Tab crash / network drop**: `beforeunload` is unreliable. The 2s client-side stale filter is the safety net. Cursors may ghost for up to 2s after an ungraceful close.
- **First-frame slide**: Without the transition-skip-on-mount logic, cursors animate from the origin on first appearance. Must be implemented.

## Migration Plan

- Schema change (new table) is additive — no migration needed for existing data.
- Frontend changes are isolated to `image-detail-modal.svelte` and a new cursor component.
- Deploy Convex backend (schema + functions) before or alongside frontend deploy; no ordering dependency since the feature is purely additive.

## Open Questions

- None at implementation time.
