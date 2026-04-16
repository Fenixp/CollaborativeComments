## MODIFIED Requirements

### Requirement: Users can authenticate before using protected application features
The system SHALL require users to authenticate before they can upload images, create comments, or access protected application views, and SHALL present a clear provider-backed sign-in path plus a sign-up path from unauthenticated shell views when the provider supports both.

#### Scenario: Unauthenticated user attempts to access protected functionality
- **WHEN** an unauthenticated user navigates to a protected image review or upload flow
- **THEN** the system presents a sign-in path instead of protected functionality

#### Scenario: User is shown the login entry point
- **WHEN** an unauthenticated user is presented with the application's login surface
- **THEN** the system shows a focused provider-managed authentication surface that emphasizes sign-in and, when supported, provides a clear sign-up path without unrelated navigation actions

### Requirement: The application presents distinct unauthenticated and authenticated shell screens
The system SHALL present a polished, mobile-friendly authentication-oriented screen for unauthenticated users and an otherwise empty authenticated landing page for signed-in users.

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
- **THEN** the system renders an authenticated empty index page suitable for future feature implementation
