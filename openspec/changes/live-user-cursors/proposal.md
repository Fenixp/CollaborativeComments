## Why

Users viewing the same image simultaneously have no awareness of each other's presence or attention. Showing live mouse cursors gives collaborators a shared spatial context, making the experience feel genuinely collaborative rather than a static comment board.

## What Changes

- When a user opens an image detail modal, their cursor position is broadcast to all other users currently viewing that image
- Other users' cursors are rendered as small colored arrows (using each user's assigned identity color) overlaid on the image
- Cursor positions update at a 500ms interval while the mouse is over the image
- When a user's mouse leaves the image area, their cursor stays visible at its last known position
- When a user closes the image modal, their cursor is removed from other users' views
- Users do not see their own cursor echoed back

## Capabilities

### New Capabilities
- `live-cursors`: Real-time cursor presence tracking and rendering on the image overlay — includes broadcasting, receiving, and smoothly animating remote cursors

### Modified Capabilities

## Impact

- **Convex schema**: New `imageCursors` table added
- **Convex backend**: Two new mutations (`upsertCursor`, `clearCursor`) and one new query (`listImageCursors`)
- **Frontend**: New cursor overlay component; `image-detail-modal.svelte` updated to track mouse position and subscribe to cursor updates
- **No breaking changes** to existing comments or gallery functionality
