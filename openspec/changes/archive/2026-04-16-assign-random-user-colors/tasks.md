## 1. User model and palette setup

- [x] 1.1 Add an application users table or equivalent persisted user model field in Convex that includes the fixed display color attribute.
- [x] 1.2 Define the curated bright, contrasting color palette in a centralized backend module or constant.

## 2. User bootstrap and persistence

- [x] 2.1 Update authenticated user bootstrap or creation logic so first-time users receive one random color from the approved palette.
- [x] 2.2 Ensure returning users keep their existing color and that legacy users missing a color are repaired lazily instead of being re-randomized on every sign-in.

## 3. Expose the color through application contracts

- [x] 3.1 Extend the application user contract returned to the frontend or consuming features so the persisted color is available for collaborative UI usage.
- [x] 3.2 Keep the frontend auth/user types aligned with the new contract without introducing manual color selection behavior.

## 4. Verification

- [x] 4.1 Verify a first-time authenticated user gets a stored color from the approved palette.
- [x] 4.2 Verify a returning user keeps the same stored color across later sessions.
- [x] 4.3 Verify duplicate colors across different users are accepted without error.
- [x] 4.4 Verify an existing user record missing a color is backfilled with a palette color when encountered.
