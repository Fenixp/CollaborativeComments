## ADDED Requirements

### Requirement: Authenticated users can open a committed gallery image in a detail modal
The system SHALL let an authenticated user open any committed gallery image from the shared gallery into a detail modal that presents the selected image at the largest practical viewport-constrained size without changing its aspect ratio, and the gallery image trigger SHALL provide a subtle hover affordance that communicates clickability.

#### Scenario: User opens an existing image from the gallery
- **WHEN** an authenticated user clicks an existing committed image in the shared gallery
- **THEN** the system opens a detail modal for that selected image

#### Scenario: Existing image appears interactive before activation
- **WHEN** an authenticated user hovers an existing committed image in the shared gallery
- **THEN** the system shows a subtle visual hover affordance indicating that the image can be opened

#### Scenario: Detail modal preserves image aspect ratio while maximizing visible size
- **WHEN** the system renders the selected image inside the detail modal
- **THEN** the image fills as much of the available modal viewport area as possible without being stretched or squashed

### Requirement: Image detail modal follows the existing application modal interaction pattern
The system SHALL make the image detail modal behave like the existing application modal pattern by providing a backdrop, a close button, an OK button, Escape-key dismissal, and backdrop-click dismissal, and each dismissal path SHALL close the modal without changing gallery data.

#### Scenario: User dismisses the image detail modal with explicit controls
- **WHEN** an authenticated user activates the close button or the OK button in the image detail modal
- **THEN** the system closes the modal and returns the user to the gallery view

#### Scenario: User dismisses the image detail modal with existing modal shortcuts
- **WHEN** an authenticated user presses Escape or clicks the modal backdrop while the image detail modal is open
- **THEN** the system closes the modal and returns the user to the gallery view
