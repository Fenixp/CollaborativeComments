## ADDED Requirements

### Requirement: Authenticated users can add positioned comments to a gallery image from the image detail modal
The system SHALL let an authenticated user create a comment from within the image detail modal by clicking directly on the displayed image, opening a comment draft anchored to that clicked position, and submitting a non-empty comment that is stored against that image.

#### Scenario: User opens a draft by clicking the image
- **WHEN** an authenticated user clicks within the displayed image area inside the image detail modal
- **THEN** the system opens a comment draft anchored to that clicked image position

#### Scenario: User submits a valid comment draft
- **WHEN** an authenticated user enters a non-empty comment draft and presses Enter or activates the OK action
- **THEN** the system persists the comment for that image and replaces the draft with a saved comment marker

### Requirement: Comment drafts expose and enforce the 100-character limit
The system SHALL display the comment draft's 100-character limit as soon as the draft opens and SHALL prevent the user from entering more than 100 characters.

#### Scenario: Character limit is immediately visible
- **WHEN** the system opens a comment draft
- **THEN** the draft UI shows the current character count or remaining capacity against the 100-character limit without requiring further user interaction

#### Scenario: Input stops at the maximum length
- **WHEN** an authenticated user types into a comment draft that has reached 100 characters
- **THEN** the system prevents any additional characters from being entered into that draft

### Requirement: The system allows only one active comment draft at a time
The system SHALL allow at most one open comment draft per viewer in the image detail modal, and repeated attempts to create another draft while one is already open SHALL redirect attention back to the existing draft instead of opening a second one.

#### Scenario: Clicking the image while a draft is already open
- **WHEN** an authenticated user clicks the displayed image while their comment draft is still open
- **THEN** the system keeps the existing draft open, moves focus to it, and shows a visible red flash on that draft

#### Scenario: User explicitly dismisses a draft
- **WHEN** an authenticated user presses Escape or activates the trash action while a comment draft is open
- **THEN** the system closes the draft without creating a saved comment

### Requirement: Saved comment markers synchronize in real time for authenticated viewers
The system SHALL render each saved image comment as a positioned marker and SHALL synchronize newly saved comments to all authenticated users viewing that image without requiring a manual refresh.

#### Scenario: New comment appears for another viewer in real time
- **WHEN** one authenticated user saves a comment on an image while another authenticated user is viewing that same image detail modal
- **THEN** the second viewer sees the new comment marker appear automatically

#### Scenario: Marker stays aligned as the image resizes
- **WHEN** the image detail modal renders the same saved comment marker at different responsive image sizes
- **THEN** the marker remains attached to the same relative position within the image content

### Requirement: Comment markers reveal author-attributed popups on hover and click
The system SHALL show a popup for an existing comment marker on hover, SHALL pin that popup open when the marker is clicked, and SHALL display the author's current name, current user color, and comment text in the popup.

#### Scenario: Hovering a marker previews the comment
- **WHEN** an authenticated user hovers over an existing comment marker
- **THEN** the system shows a popup containing the comment author's current name, the comment text, and styling that uses the author's current user color

#### Scenario: Clicking a marker pins the popup
- **WHEN** an authenticated user clicks an existing comment marker
- **THEN** the system keeps that comment popup visible until the user opens a different comment popup or dismisses it with the popup's close action

#### Scenario: Opening a different pinned popup replaces the current one
- **WHEN** an authenticated user clicks a different existing comment marker while a comment popup is pinned open
- **THEN** the system closes the previously pinned popup and pins the newly selected comment popup instead
