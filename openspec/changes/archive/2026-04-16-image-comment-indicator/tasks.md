## 1. Convex Backend

- [x] 1.1 Add a `getCommentCountsByImageId` Convex query in `src/convex/comments.ts` that returns an object mapping each image ID to its comment count
- [x] 1.2 Regenerate Convex types (`src/convex/_generated/api.d.ts`) so the new query is typed

## 2. Gallery Data Layer

- [x] 2.1 In `src/lib/features/gallery/gallery.ts`, subscribe to the new `getCommentCountsByImageId` query and expose the counts map alongside existing gallery data

## 3. Badge UI Component

- [x] 3.1 In `gallery-experience.svelte`, add a `position: relative` wrapper (or confirm it exists) on each image card
- [x] 3.2 Add the comment count badge element (`position: absolute; bottom: 8px; right: 8px`) inside each card, bound to the count from the gallery data layer
- [x] 3.3 Hide the badge when count is 0 (conditional render or `display: none`)
- [x] 3.4 Style the badge (background, text color, border-radius, font size) to be legible over the thumbnail

## 4. Flash Animation

- [x] 4.1 Define a CSS keyframe animation (e.g., `@keyframes badge-flash`) that pulses the badge briefly
- [x] 4.2 Track previous count values per image in a local map so increases can be detected
- [x] 4.3 When a count increases (and is not the initial render), add the animation class to the badge and remove it after the animation completes via `setTimeout`

## 5. Verification

- [ ] 5.1 Open the gallery with images that have existing comments and confirm badges show correct counts (manual)
- [ ] 5.2 Add a new comment from the detail modal and confirm the gallery badge updates in real time and flashes (manual)
- [ ] 5.3 Confirm images with zero comments show no badge (manual)
- [ ] 5.4 Confirm the badge does not flash on initial page load (manual)
