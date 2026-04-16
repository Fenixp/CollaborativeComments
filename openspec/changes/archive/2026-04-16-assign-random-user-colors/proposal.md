## Why

As more collaborative image activity appears in the product, users need a lightweight visual cue that helps them distinguish who is who across shared views. Assigning each registered user a fixed bright, high-contrast color at registration time gives the application a stable identity marker without requiring manual profile setup or globally unique color management.

## What Changes

- Extend the persisted application user model with a fixed display color value that is assigned automatically when a user record is created.
- Introduce a controlled palette of bright, contrasting colors suitable for identifying users in shared image-related interfaces.
- Ensure the assigned color remains stable for each user across future sessions and repeated use of the application.
- Allow different users to receive the same color when the random assignment selects the same palette entry.

## Capabilities

### New Capabilities
- `user-identity-colors`: Automatic assignment and persistence of bright, contrasting per-user display colors for registered application users.

### Modified Capabilities
- `user-authentication`: Persisted authenticated application users now include a stable display color assigned during first-time user creation.

## Impact

- Affected backend areas: user schema/model fields, first-user-creation logic, and any server-side user bootstrap flow.
- Affected frontend/product behavior: authenticated user records expose a stable color value that downstream collaborative image UI can use for differentiation.
- Affected data model: existing and newly created application users need a persisted color attribute sourced from a curated bright/high-contrast palette.
