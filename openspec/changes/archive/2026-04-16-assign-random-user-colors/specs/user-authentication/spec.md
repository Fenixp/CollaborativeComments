## MODIFIED Requirements

### Requirement: Authenticated identities are persisted as application users
The system SHALL establish an authenticated application identity that can be used to render authenticated shell routes and Convex-authenticated requests, and SHALL persist a fixed display color for each registered application user so collaborative product surfaces can differentiate users consistently across sessions.

#### Scenario: First authenticated visit
- **WHEN** a user authenticates with the application for the first time
- **THEN** the system establishes an authenticated session usable by the frontend shell and Convex client and persists a new application user record with a fixed display color

#### Scenario: Returning authenticated visit
- **WHEN** a previously known user authenticates again
- **THEN** the system restores authenticated shell access without requiring business-domain setup and preserves the user's previously assigned display color
