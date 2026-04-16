## Context

The current unauthenticated root screen is technically functional but visually reads as scaffold documentation. It uses implementation-facing copy, weak product hierarchy, and a static sign-in action that does not communicate intermediate states well. The change affects the root route, the login card, the brand presentation, and the frontend auth presentation flow, but it should not change backend behavior or authenticated-shell scope.

The current frontend already initializes Clerk through the JavaScript SDK and opens provider UI with `openSignIn()`. The main design question is whether the login card should continue using a modal sign-in trigger or render provider-managed authentication UI directly inside the card, including a sign-up path when Clerk supports it cleanly.

## Goals / Non-Goals

**Goals:**
- Deliver a more polished unauthenticated experience that feels like a product entry point rather than setup documentation.
- Make the application title more prominent and support a professional SaaS tone with a small amount of warmth.
- Support a mobile-first layout with focused authentication entry points.
- Remove implementation-detail messaging from the unauthenticated surface.
- Improve perceived responsiveness by presenting clear loading, ready, and error states.
- Prefer embedded Clerk-managed authentication UI when feasible so email/password fields and sign-up entry can appear directly in the card.

**Non-Goals:**
- Changing authenticated-shell behavior, business-domain functionality, or account-management scope.
- Replacing Clerk as the authentication provider.
- Introducing custom-built credential handling when Clerk-managed UI can satisfy the requirements.
- Changing backend auth/session semantics or Convex integration contracts.

## Decisions

### 1. Use a single-card, mobile-first login layout with stronger branding
The root screen will keep the current simple structure rather than becoming a split-screen landing page. The brand block and the login card will be visually tightened so the title becomes a primary element, the subtitle becomes supportive rather than dominant, and the card becomes the only action surface.

**Why:** This preserves the lightweight shell while addressing the current weak hierarchy and poor mobile emphasis.

**Alternatives considered:**
- **Split-screen marketing layout:** Rejected because the user explicitly wants a sharper version of the existing card rather than a larger landing-page rewrite.
- **App-preview background with auth gate:** Rejected because it implies product surface area that does not exist yet.

### 2. Prefer embedded Clerk-managed authentication UI over modal triggers
The implementation should first attempt to render Clerk's provider-managed authentication experience directly inside the login card so users can see fields such as email and password inline and access a clear sign-up path when Clerk supports that integration path in the current stack. If embedded rendering is not viable with the existing frontend setup, the fallback is a compact set of provider-backed actions that includes `Sign in` and `Sign up` without any unrelated preview/navigation action.

**Why:** Inline provider-managed authentication better matches the desired product feel, makes the screen more obviously reactive, and avoids maintaining custom sign-in or sign-up flows.

**Alternatives considered:**
- **Continue using `openSignIn()` modal as the primary experience:** Acceptable as fallback, but not preferred because it feels detached from the page and leaves sign-up as a separate unresolved path.
- **Build custom email/password fields against Clerk APIs:** Rejected because it introduces avoidable auth-flow complexity, especially around validation, error handling, and future second-factor support.

### 3. Remove implementation-facing messaging from the unauthenticated surface
The login screen will remove references to Clerk/Convex internals, scaffolding language, and unnecessary preview/navigation actions. Copy should be short, product-facing, and oriented around signing in or creating access to a workspace.

**Why:** The current copy undermines product credibility and distracts from the sign-in action.

**Alternatives considered:**
- **Keep technical notes in a secondary info panel:** Rejected because the login page is not the right place for implementation details.

### 4. Make auth presentation states explicit in the screen design
The screen should present clear unauthenticated states: initializing session/auth libraries, ready to authenticate, opening or rendering provider-managed UI, and error. These states should be visible in the card or immediate surrounding context, not hidden behind inert controls.

**Why:** The current experience feels static because only coarse route-level branching exists and the primary action does not visibly respond.

**Alternatives considered:**
- **Route-level loading only:** Rejected because it still leaves the user without feedback during sign-in initiation.

## Risks / Trade-offs

- **Embedded Clerk support may be awkward with the current plain Clerk JS setup** → Mitigation: explicitly allow modal-based `Sign in` and `Sign up` fallbacks while keeping the rest of the redesign intact.
- **More auth UI state in the shell can add frontend complexity** → Mitigation: keep state modeling limited to presentation concerns and continue delegating authentication mechanics to Clerk.
- **A more product-like screen can imply more feature maturity than the app currently has** → Mitigation: keep copy restrained and avoid marketing claims beyond sign-in and workspace access.
- **Mobile polish can regress desktop spacing if tuned narrowly** → Mitigation: design mobile-first but preserve centered desktop rhythm with restrained max widths.

## Migration Plan

No data or backend migration is required. Rollout is a frontend-only replacement of the unauthenticated presentation. If embedded Clerk rendering proves infeasible during implementation, the fallback is to ship the redesigned layout with provider-backed `Sign in` and `Sign up` actions.

## Open Questions

- Does the current Clerk JS integration support embedded sign-in and sign-up mounting cleanly in Svelte without adding a new wrapper library?
- If embedded authentication UI is used, what level of Clerk appearance customization is available within the current SDK approach?
