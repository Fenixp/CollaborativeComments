## 1. Authentication presentation strategy

- [x] 1.1 Evaluate the current Clerk JS integration for embedded sign-in and sign-up support and confirm whether in-card Clerk-managed authentication UI can be mounted in the existing Svelte setup.
- [x] 1.2 Define the fallback behavior to provider-backed `Sign in` and `Sign up` actions if embedded Clerk rendering is not viable without undesirable complexity.

## 2. Unauthenticated screen redesign

- [x] 2.1 Update the root unauthenticated layout to emphasize the application title and support a polished mobile-first composition.
- [x] 2.2 Refine the login card copy and structure to remove implementation-detail messaging while supporting clear sign-in and sign-up entry points.
- [x] 2.3 Adjust the branding treatment so the product name is more visually prominent while keeping the tone professional with a small amount of warmth.

## 3. Sign-in interaction states

- [x] 3.1 Implement explicit unauthenticated presentation states for initializing, ready, sign-in-in-progress or sign-in-rendering, and error conditions.
- [x] 3.2 Ensure the authentication surface presents clear sign-in and sign-up entry points, using embedded Clerk UI when supported or provider-backed buttons otherwise.

## 4. Validation and finish

- [x] 4.1 Review the unauthenticated screen on narrow and desktop layouts to confirm hierarchy, spacing, and CTA focus match the updated requirements.
- [x] 4.2 Verify the authenticated landing page and account-management entry points still behave correctly after the unauthenticated-shell changes.
