## ADDED Requirements

### Requirement: Cursor position is broadcast while viewing an image
While a user has an image detail modal open and their mouse is over the image, the system SHALL transmit the cursor's normalized (0–1) x/y position to the backend at most every 500ms.

#### Scenario: Position is sent on mousemove interval
- **WHEN** a user moves their mouse over the image stage
- **THEN** the system records the normalized position and schedules an upsert to the backend within 500ms

#### Scenario: Position transmission stops when mouse leaves image
- **WHEN** the user's mouse leaves the image stage element
- **THEN** the system stops transmitting new positions (last known position persists on the backend)

#### Scenario: No transmission when modal is closed
- **WHEN** the image detail modal is not open
- **THEN** no cursor data is transmitted for that user

### Requirement: Cursor is cleared when the image modal is closed
When a user closes the image detail modal, the system SHALL mark their cursor as inactive so it is no longer visible to other users.

#### Scenario: Modal close clears cursor
- **WHEN** the user closes the image detail modal (via close button, backdrop click, or Escape key)
- **THEN** the system sends a clearCursor mutation that marks their cursor inactive for that image

### Requirement: Remote cursors are displayed on the image overlay
All active cursors from other users viewing the same image SHALL be rendered as overlays on the image stage, using the image's normalized coordinate space.

#### Scenario: Remote cursor appears when another user views the image
- **WHEN** another authenticated user opens the same image and moves their mouse over it
- **THEN** their cursor appears on the image overlay at the reported position

#### Scenario: Own cursor is not shown
- **WHEN** the current user's own cursor data is included in the server response
- **THEN** it is excluded from rendering (user does not see their own cursor echoed)

#### Scenario: Stale cursors are hidden
- **WHEN** a cursor's last update timestamp is more than 2000ms in the past
- **THEN** the cursor is not rendered, regardless of its `isActive` flag

### Requirement: Remote cursors use the user's identity color
Each remote cursor SHALL be rendered as a small SVG pointer arrow filled with the cursor owner's assigned identity color and outlined in white for contrast.

#### Scenario: Cursor color matches user identity
- **WHEN** a remote cursor is rendered
- **THEN** the SVG fill color matches the cursor owner's `colorValue` from the user identity system

#### Scenario: White outline for contrast
- **WHEN** a remote cursor is rendered over any image content
- **THEN** the SVG arrow has a white stroke outline ensuring visibility against varied backgrounds

### Requirement: Cursor position updates animate smoothly
Remote cursor positions SHALL transition smoothly between updates with no visible jump.

#### Scenario: Smooth movement on position update
- **WHEN** a remote cursor's position changes due to a backend update
- **THEN** the cursor animates to the new position over approximately 500ms (matching the update interval)

#### Scenario: No slide-in animation on first appearance
- **WHEN** a remote cursor appears for the first time on the overlay
- **THEN** it is placed immediately at its reported position without a transition animation
