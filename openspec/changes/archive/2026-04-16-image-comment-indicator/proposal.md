## Why

Users browsing the gallery have no way to know which images have active discussions without opening each one individually. A comment count indicator on each gallery thumbnail gives users an at-a-glance signal of community engagement and surfaces popular discussions.

## What Changes

- Each image card in the gallery gains a small badge in the bottom-right corner displaying the comment count
- The badge animates briefly (flash/pulse) when a new comment is added while the gallery is visible
- The badge is hidden or shows zero when an image has no comments
- Comment counts are fetched reactively so new comments appear without a page refresh

## Capabilities

### New Capabilities
- `gallery-comment-indicator`: Per-image comment count badge overlaid on gallery thumbnails, with real-time update and flash animation when counts change

### Modified Capabilities
- `image-gallery`: Gallery card UI gains an overlay element; the gallery data layer must surface per-image comment counts alongside existing image data

## Impact

- `src/lib/features/gallery/components/gallery-experience.svelte` — image card markup needs badge overlay
- `src/lib/features/gallery/gallery.ts` — query must include comment counts per image
- `src/convex/` — may need a query that returns comment counts keyed by image ID
- No breaking changes to existing APIs or data models
