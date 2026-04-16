## Why

The current unauthenticated screen reads like scaffold documentation instead of a polished product entry point, and it does not feel responsive during authentication transitions. The login experience should better represent the application, remove implementation details, and work cleanly on mobile before additional product features are added.

## What Changes

- Refine the unauthenticated root screen into a polished, mobile-friendly sign-in experience with stronger product branding.
- Remove implementation-facing language and unnecessary secondary actions from the login surface.
- Replace the current login entry pattern with a focused authentication experience, preferring embedded Clerk-managed sign-in and sign-up entry points when supported.
- Improve visible authentication states so loading, ready, and error conditions feel responsive and intentional.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `user-authentication`: Update the unauthenticated shell requirements to require a polished, mobile-friendly authentication screen with prominent branding, no implementation-detail messaging, and clear sign-in plus sign-up entry points when supported by the provider UI.

## Impact

- Affected code: unauthenticated root route, login card component, branding component, and auth state handling for login presentation states.
- Affected dependencies/systems: Clerk authentication presentation on the frontend, including evaluation of embedded Clerk UI versus modal fallback for sign-in and sign-up entry points.
- No backend API or data model changes are expected.
