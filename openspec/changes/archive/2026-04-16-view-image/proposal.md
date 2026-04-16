## Why

The gallery currently lets authenticated users upload and browse committed images, but once an image is rendered in the grid there is no way to inspect it at a larger size. Users need a simple detail view so they can open an existing image, see it at near full-screen size without distortion, and dismiss it with the same interaction style already used by the application modal pattern.

## What Changes

- Add an image detail modal that opens when a user clicks an existing gallery image.
- Display the selected image as large as the viewport allows while preserving its original aspect ratio.
- Make the detail modal follow the existing application modal interaction pattern, including backdrop presentation, a close button, an OK button, Escape-to-close behavior, and backdrop-click dismissal.
- Keep modal state and selection handling within the gallery experience while keeping the grid and image cards focused on presentation and selection intent.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `image-gallery`: extend gallery browsing so users can open an existing image in a dismissible detail modal with large-format viewing behavior.

## Impact

- Affected frontend areas: `src/lib/features/gallery/components/gallery-experience.svelte`, `gallery-grid.svelte`, and `gallery-image-card.svelte`.
- Affected behavior: gallery image cards become interactive and can open a detail modal owned by the gallery experience.
- No backend, storage, or API contract changes are expected.
