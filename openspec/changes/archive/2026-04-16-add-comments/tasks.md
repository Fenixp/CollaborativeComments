## 1. Convex comment model and APIs

- [x] 1.1 Add an `imageComments` table to the Convex schema with image reference, author subject, normalized coordinates, comment text, and timestamps plus indexes for image-scoped reads.
- [x] 1.2 Implement a realtime query that lists comments for a selected image and resolves each comment's current author name and current color from the users table.
- [x] 1.3 Implement an authenticated mutation for creating an image comment that validates image ownership scope, non-empty text, 100-character maximum, and normalized coordinates.

## 2. Gallery comment feature state and types

- [x] 2.1 Add gallery comment types and API references in the frontend feature layer so image detail UI can subscribe to and create comments.
- [x] 2.2 Define the image comment overlay state model for draft, hover-preview, and pinned-popup behavior with one active draft and one active popup at a time.

## 3. Image detail modal commenting UI

- [x] 3.1 Refactor the image detail modal to render the selected image inside a positioned annotation stage that can translate clicks into normalized coordinates.
- [x] 3.2 Implement the anchored draft comment popup with autofocus, visible character limit, Enter/OK submission, trash dismissal, Escape dismissal, and red-flash refocus behavior when a second click occurs during an active draft.
- [x] 3.3 Render saved comment markers using each author's current color and keep them aligned to the same relative image position as the modal resizes.
- [x] 3.4 Implement hover preview and click-to-pin comment popups, including author name, comment text, author-colored styling, close action, and replacement of an already pinned popup when another marker is clicked.

## 4. Integration polish

- [x] 4.1 Wire comment subscriptions to the selected image lifecycle so realtime listeners start when the detail modal opens and stop when it closes.
- [x] 4.2 Review empty, loading, and error handling paths for comment creation and comment display so the modal remains usable when comment data is unavailable.
