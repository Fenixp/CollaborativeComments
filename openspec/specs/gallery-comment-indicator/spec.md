## ADDED Requirements

### Requirement: Each gallery image displays a comment count badge when comments exist
The system SHALL render a small badge in the bottom-right corner of each gallery thumbnail showing the total number of saved comments for that image, and SHALL hide the badge when the image has zero comments.

#### Scenario: Image with comments shows a count badge
- **WHEN** an authenticated user views the gallery and a committed image has one or more saved comments
- **THEN** the system shows a badge in the bottom-right corner of that image thumbnail with the exact comment count

#### Scenario: Image without comments shows no badge
- **WHEN** an authenticated user views the gallery and a committed image has zero saved comments
- **THEN** the system does not render a visible badge on that image thumbnail

### Requirement: Comment count badges update in real time as new comments are added
The system SHALL reactively update each gallery thumbnail's comment count badge when a new comment is saved for that image, without requiring a page refresh.

#### Scenario: Badge count updates when a comment is added from the detail modal
- **WHEN** an authenticated user saves a new comment on an image while the gallery is visible
- **THEN** the comment count badge for that image in the gallery updates to reflect the new total

### Requirement: Comment count badge briefly flashes when the count increases
The system SHALL animate the comment count badge with a brief flash effect when its count increases, to draw attention to the update.

#### Scenario: Badge flashes on count increase
- **WHEN** the comment count for a gallery image increases while that image is visible in the gallery
- **THEN** the badge plays a brief flash animation and then returns to its resting appearance

#### Scenario: Badge does not flash on initial render
- **WHEN** the gallery first renders and comment counts are loaded for the first time
- **THEN** no flash animation plays on any badge regardless of comment count
