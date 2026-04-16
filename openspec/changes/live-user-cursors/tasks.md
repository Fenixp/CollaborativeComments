## 1. Convex Schema

- [x] 1.1 Add `imageCursors` table to `src/convex/schema.ts` with fields: `imageId`, `userSubject`, `x`, `y`, `updatedAt`, `isActive`, and indexes `by_image` and `by_user_image`

## 2. Convex Backend

- [x] 2.1 Create `src/convex/cursors.ts` with `upsertCursor` mutation (upsert by userSubject+imageId, validates x/y 0–1, requires auth)
- [x] 2.2 Add `clearCursor` mutation to `src/convex/cursors.ts` (sets `isActive = false` for the current user's cursor on the given image, requires auth)
- [x] 2.3 Add `listImageCursors` query to `src/convex/cursors.ts` (returns all `isActive = true` cursors for the image, joins user colorToken/colorValue, excludes no one — filtering of own cursor happens client-side)

## 3. API Wiring

- [x] 3.1 Export cursor functions from `src/convex/cursors.ts` and add them to `galleryApi` in `src/lib/features/gallery/gallery.ts`

## 4. Cursor SVG Component

- [x] 4.1 Create `src/lib/features/gallery/components/cursor-arrow.svelte` — inline SVG pointer arrow, props: `colorValue: string`, renders with white stroke outline and user color fill

## 5. Modal Integration

- [x] 5.1 In `image-detail-modal.svelte`, subscribe to `listImageCursors` via `client.onUpdate` (same pattern as comments), storing results in a `$state` variable; unsubscribe on modal destroy
- [x] 5.2 Add `mousemove` handler on the image stage element that captures normalized x/y and stores the latest position in a local variable (no immediate write)
- [x] 5.3 Add `mouseleave` handler on the image stage that stops the interval timer without sending a clear
- [x] 5.4 Set up a `setInterval` (500ms) that fires `upsertCursor` when the modal is open — only sends if mouse has been over image since last tick; clear interval on modal destroy
- [x] 5.5 Call `clearCursor` mutation when the modal closes (in the `closeModal` function and the `$effect` cleanup)
- [x] 5.6 Render remote cursors in the image overlay: for each cursor in the subscription result, skip own subject, skip if `updatedAt < Date.now() - 2000`, render `<CursorArrow>` at `left: x*100%`, `top: y*100%` with CSS transition and first-mount transition skip logic
