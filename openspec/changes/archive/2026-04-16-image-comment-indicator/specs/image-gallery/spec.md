## MODIFIED Requirements

### Requirement: Authenticated users can browse a shared realtime image gallery
The system SHALL present authenticated users with a shared image gallery that lists all fully uploaded images in newest-first order and updates in real time when any authenticated user completes an upload. Each gallery image SHALL display a comment count badge when comments exist, and the badge SHALL update in real time as new comments are added.

#### Scenario: Authenticated user views committed images
- **WHEN** an authenticated user opens the root application route and committed images exist
- **THEN** the system shows all fully uploaded images in a shared gallery ordered from newest to oldest

#### Scenario: Shared gallery updates after another user upload completes
- **WHEN** one authenticated user successfully finishes uploading an image while another authenticated user is viewing the gallery
- **THEN** the viewing user sees the new committed image appear without manually refreshing the page

#### Scenario: Incomplete uploads stay out of the shared gallery
- **WHEN** an image is still uploading, finalizing, or has failed before completion
- **THEN** the system does not show that image in the shared gallery

#### Scenario: Gallery image cards include a comment count badge overlay
- **WHEN** an authenticated user views the gallery
- **THEN** each image card that has saved comments shows a comment count badge in the bottom-right corner of its thumbnail
