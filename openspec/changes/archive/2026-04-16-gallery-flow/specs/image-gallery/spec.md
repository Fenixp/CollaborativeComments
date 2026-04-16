## ADDED Requirements

### Requirement: Authenticated users can browse a shared realtime image gallery
The system SHALL present authenticated users with a shared image gallery that lists all fully uploaded images in newest-first order and updates in real time when any authenticated user completes an upload.

#### Scenario: Authenticated user views committed images
- **WHEN** an authenticated user opens the root application route and committed images exist
- **THEN** the system shows all fully uploaded images in a shared gallery ordered from newest to oldest

#### Scenario: Shared gallery updates after another user upload completes
- **WHEN** one authenticated user successfully finishes uploading an image while another authenticated user is viewing the gallery
- **THEN** the viewing user sees the new committed image appear without manually refreshing the page

#### Scenario: Incomplete uploads stay out of the shared gallery
- **WHEN** an image is still uploading, finalizing, or has failed before completion
- **THEN** the system does not show that image in the shared gallery

### Requirement: Authenticated users can upload images into the shared gallery
The system SHALL provide authenticated users with an add-image action and upload workflow that allows them to choose an image file from disk, edit the image name before submission, and create a committed gallery image visible to all authenticated users after the upload completes.

#### Scenario: User starts upload from the gallery
- **WHEN** an authenticated user views the gallery screen
- **THEN** the system shows a prominent add-image action that opens an upload workflow

#### Scenario: Upload form autofills editable image name
- **WHEN** an authenticated user selects an image file in the upload workflow
- **THEN** the system autofills the image name from the original filename and allows the user to edit that name before upload submission

#### Scenario: Completed upload becomes shared gallery content
- **WHEN** an authenticated user finishes a valid image upload
- **THEN** the system persists the image as committed shared gallery content and makes it visible to all authenticated users

### Requirement: Image uploads enforce validation and duplicate-name resolution
The system SHALL accept only image uploads that satisfy the allowed MIME-type and size rules, SHALL require a non-empty image name at upload time, and SHALL resolve duplicate final names in the backend by silently appending a short GUID suffix before the file extension.

#### Scenario: Invalid MIME type is rejected before upload
- **WHEN** an authenticated user selects a non-image file in the upload workflow
- **THEN** the system stops the upload before it begins and reports that only image files are allowed

#### Scenario: Oversized image is rejected before upload
- **WHEN** an authenticated user selects an image file larger than 2 MB
- **THEN** the system stops the upload before it begins and reports the 2 MB maximum size limit

#### Scenario: Backend rejects invalid upload constraints
- **WHEN** an upload request reaches the backend with a non-image MIME type, an image larger than 2 MB, or an empty image name
- **THEN** the system rejects the upload instead of creating committed gallery content

#### Scenario: Duplicate image name is resolved silently
- **WHEN** an authenticated user uploads an image whose final name would collide with an existing image name
- **THEN** the backend stores the image under a unique name created by appending a short GUID suffix before the extension without requiring extra user action

### Requirement: Failed uploads are cleaned up and thumbnails fail gracefully
The system SHALL clean up partial upload artifacts when a multi-step upload fails after persistence has started, and SHALL show a branded fallback image when a committed image thumbnail cannot be rendered.

#### Scenario: Partial upload artifacts are removed after failure
- **WHEN** an image upload fails after a storage object or non-ready metadata record has been created
- **THEN** the system deletes the partial artifacts so the failed image does not remain stored or visible

#### Scenario: Missing or broken thumbnail uses branded fallback
- **WHEN** a committed image thumbnail URL is unavailable or the thumbnail fails to render in the gallery
- **THEN** the system shows a branded fallback image for that gallery item instead of a broken thumbnail

#### Scenario: Empty gallery encourages first upload
- **WHEN** an authenticated user opens the gallery and no committed images exist
- **THEN** the system shows an empty-state message encouraging the user to be the first to upload one
