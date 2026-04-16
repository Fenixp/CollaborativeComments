## ADDED Requirements

### Requirement: Users can authenticate before using protected application features
The system SHALL require users to authenticate before they can upload images, create comments, or access protected application views, and SHALL present a clear provider-backed sign-in path plus a sign-up path from unauthenticated shell views when the provider supports both.

#### Scenario: Unauthenticated user attempts to access protected functionality
- **WHEN** an unauthenticated user navigates to a protected image review or upload flow
- **THEN** the system presents a sign-in path instead of protected functionality

#### Scenario: User is shown the login entry point
- **WHEN** an unauthenticated user is presented with the application's login surface
- **THEN** the system shows a focused provider-managed authentication surface that emphasizes sign-in and, when supported, provides a clear sign-up path without unrelated navigation actions

#### Scenario: Authenticated user accesses protected functionality
- **WHEN** a user returns from a successful authentication flow
- **THEN** the system grants access to protected application functionality

### Requirement: Users can manage session lifecycle from the application
The system SHALL provide authenticated users with a way to sign out and SHALL preserve authenticated session state so users do not need to re-authenticate on every page load.

#### Scenario: User signs out
- **WHEN** an authenticated user chooses to sign out
- **THEN** the system ends the authenticated session for the application and returns the user to an unauthenticated state

#### Scenario: User refreshes while signed in
- **WHEN** an authenticated user reloads the application with a still-valid session
- **THEN** the system restores the authenticated application state without requiring an immediate new sign-in interaction

### Requirement: Authenticated identities are persisted as application users
The system SHALL establish an authenticated application identity that can be used to render authenticated shell routes and Convex-authenticated requests, and SHALL persist a fixed display color for each registered application user so collaborative product surfaces can differentiate users consistently across sessions.

#### Scenario: First authenticated visit
- **WHEN** a user authenticates with the application for the first time
- **THEN** the system establishes an authenticated session usable by the frontend shell and Convex client and persists a new application user record with a fixed display color

#### Scenario: Returning authenticated visit
- **WHEN** a previously known user authenticates again
- **THEN** the system restores authenticated shell access without requiring business-domain setup and preserves the user's previously assigned display color

### Requirement: The application presents distinct unauthenticated and authenticated shell screens
The system SHALL present a polished, mobile-friendly authentication-oriented screen for unauthenticated users and an authenticated gallery landing page for signed-in users.

#### Scenario: Logged out shell
- **WHEN** an unauthenticated user opens the root application route
- **THEN** the system renders a branded sign-in-focused screen instead of product business features

#### Scenario: Logged out screen avoids implementation details
- **WHEN** an unauthenticated user is shown the login-oriented screen
- **THEN** the system does not present implementation-facing messaging about internal authentication or backend integration details

#### Scenario: Logged out screen emphasizes product identity
- **WHEN** an unauthenticated user opens the root application route on a mobile or desktop screen
- **THEN** the system presents the application title prominently and keeps the sign-in experience visually focused and usable on narrow screens

#### Scenario: Logged out screen supports account creation
- **WHEN** an unauthenticated user needs to create access from the root application route
- **THEN** the system provides a visible sign-up path in the authentication surface when supported by the provider UI

#### Scenario: Logged in shell
- **WHEN** an authenticated user opens the root application route
- **THEN** the system renders an authenticated gallery landing page suitable for browsing and uploading shared images while preserving account controls

### Requirement: Users can access account management through the authentication provider
The system SHALL expose a path for authenticated users to manage their account using the external authentication provider's account-management features.

#### Scenario: Authenticated user opens account controls
- **WHEN** an authenticated user opens the account-management entry point in the application
- **THEN** the system presents provider-backed account management options such as profile or session controls
