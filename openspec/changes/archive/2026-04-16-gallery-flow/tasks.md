## 1. Backend image model and upload contracts

- [x] 1.1 Add the Convex image schema/data model with committed-visibility state, metadata fields, and authenticated access assumptions.
- [x] 1.2 Implement backend gallery read functions that return fully uploaded images only, ordered newest first, and shaped for realtime gallery rendering.
- [x] 1.3 Implement backend upload/finalization functions that enforce image-only MIME types, the 2 MB size limit, non-empty names, and silent duplicate-name resolution with a short GUID suffix.
- [x] 1.4 Implement compensating cleanup so failed uploads remove any partial storage objects and non-ready metadata records.

## 2. Frontend upload workflow and gallery UI

- [x] 2.1 Replace the authenticated placeholder landing content with a gallery experience that preserves the existing signed-in header/account controls.
- [x] 2.2 Build the add-image interaction with a prominent action, modal workflow, disk file picker, autofilled editable name, and immediate client-side validation for MIME type and size.
- [x] 2.3 Add local upload-state presentation outside the grid so users can see in-progress/failure feedback without exposing incomplete uploads in the shared gallery.
- [x] 2.4 Build the committed-image grid/cards to render shared realtime images, newest first, with the image name shown below each thumbnail.
- [x] 2.5 Add branded fallback thumbnail behavior and an empty state that encourages the first upload.

## 3. Integration and readiness

- [x] 3.1 Wire the frontend upload flow to the backend storage/finalization workflow and ensure successful uploads appear in the shared gallery for all signed-in users.
- [ ] 3.2 Verify that concurrent uploads keep the gallery live, duplicate names resolve silently, and only fully uploaded images become visible.
- [ ] 3.3 Verify failure handling for invalid MIME types, oversized files, thumbnail fallback behavior, and cleanup of partial upload artifacts.
