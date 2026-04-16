## Why

The authenticated landing page is still a scaffold placeholder, but the product now needs its first real collaborative workflow: a shared image gallery that updates in real time for every signed-in user. This change establishes the product-facing backend, storage, and UI contracts needed to upload, catalog, and browse images safely before later enhancements such as paging, sorting, filtering, rename, and delete.

## What Changes

- Replace the authenticated empty landing experience with a shared gallery view that shows fully uploaded images in newest-first order.
- Add an authenticated image-upload workflow with a prominent add-image action, upload modal, editable image name, client-side validation, and backend validation.
- Introduce backend-backed image storage and metadata records, including upload lifecycle state, real-time gallery queries, and cleanup of partial artifacts when upload finalization fails.
- Enforce image upload constraints for authenticated users: image MIME types only, 2 MB maximum size, silent duplicate-name resolution with a short GUID suffix, and branded fallback thumbnails when rendering fails.
- Preserve the existing signed-in account header while changing the authenticated root-route experience from a placeholder shell to a live product gallery.

## Capabilities

### New Capabilities
- `image-gallery`: Shared authenticated image upload and gallery browsing with real-time updates, upload validation, committed-image visibility rules, and fallback thumbnail behavior.

### Modified Capabilities
- `user-authentication`: The authenticated root application view changes from an empty placeholder shell to an authenticated gallery experience while preserving protected access and account controls.
- `project-scaffold`: The scaffold is extended beyond shell-only behavior so the application can include its first product-facing image workflow while preserving the underlying stack and frontend foundations.

## Impact

- Affected frontend areas: authenticated shell/template composition, new gallery feature components, upload modal flow, and fallback image presentation.
- Affected backend areas: Convex image schema, queries, mutations/actions for upload and cleanup orchestration, and authenticated data access.
- Affected storage/data flow: binary image storage, metadata persistence, upload-state transitions, and cleanup of partial uploads.
- Affected product behavior: authenticated users can upload and see all committed images in real time; incomplete uploads never appear in the gallery.
