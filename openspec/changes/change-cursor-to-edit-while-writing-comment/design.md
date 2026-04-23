## Context

Image comments are created from the image detail modal by clicking on the image and entering text into a single active draft. The current flow already communicates draft state through the visible draft UI, but it does not change the cursor to reflect that the user is in an editing interaction. This change is frontend-only and should fit into the existing image comment state flow without altering persistence, marker behavior, or modal interactions.

## Goals / Non-Goals

**Goals:**
- Show an edit-style cursor while a comment draft is active and awaiting text input.
- Remove the edit cursor as soon as the draft is submitted or dismissed.
- Keep the behavior scoped to the existing comment drafting experience in the image detail modal.

**Non-Goals:**
- Changing how comments are created, saved, validated, or synchronized.
- Introducing backend, schema, or API changes.
- Redesigning marker hover, popup, or gallery cursor behavior outside active drafting.

## Decisions

1. **Drive the cursor from existing draft state**  
   Reuse the existing "draft open / no draft open" UI state rather than adding a separate cursor store. This keeps the cursor synchronized with the same state transitions that already control draft rendering and dismissal.

2. **Apply the cursor change at the image interaction surface**  
   The cursor should change on the image/detail interaction area where comment placement and drafting happen, not globally across the entire page. This keeps the affordance local to the feature and avoids surprising cursor changes elsewhere in the modal.

3. **Use a standard edit/text-entry cursor style**  
   Prefer a standard CSS cursor value that communicates editing intent and works without extra assets. This avoids adding icon files or browser-specific cursor resources for a small interaction improvement.

## Risks / Trade-offs

- **[Risk] Cursor styling is applied to the wrong container and leaks outside the drafting area** → Scope the class or style binding to the same container that owns image comment interactions.
- **[Risk] Cursor state gets stuck after submit/dismiss** → Bind cursor presentation directly to draft presence so teardown happens through the same state updates already used by the draft lifecycle.
- **[Trade-off] Standard browser cursor styling may not exactly match a custom “edit icon” expectation** → Accept a native edit-style cursor for consistency, simplicity, and zero asset overhead.
