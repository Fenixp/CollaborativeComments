## ADDED Requirements

### Requirement: Registered users receive a fixed display color from a bright contrasting palette
The system SHALL assign each registered application user a display color chosen at random from a curated palette of bright, contrasting colors when the user's application record is first created.

#### Scenario: First-time user receives a palette color
- **WHEN** an authenticated user is registered in the application's persisted user model for the first time
- **THEN** the system stores one randomly selected color from the approved bright, contrasting palette on that user record

#### Scenario: Palette assignment does not require uniqueness
- **WHEN** two different users are assigned the same palette color by random selection
- **THEN** the system accepts both assignments without treating the duplicate color as an error

### Requirement: Display colors remain stable after assignment
The system SHALL preserve a user's assigned display color for future sessions and subsequent uses of the application unless the stored color is missing and needs repair.

#### Scenario: Returning user keeps the same color
- **WHEN** a previously registered user authenticates again after already receiving a display color
- **THEN** the system keeps the existing stored color instead of assigning a new one

#### Scenario: Missing color is repaired from the palette
- **WHEN** the system encounters an existing registered user record that does not have a stored display color
- **THEN** the system assigns and persists one random color from the approved bright, contrasting palette
