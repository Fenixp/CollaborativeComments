## Why

The image detail experience currently stops at viewing, which prevents teams from using the gallery as a shared feedback surface. Adding realtime, positioned comments lets authenticated users discuss specific areas of an image directly in context while preserving the app's collaborative feel.

## What Changes

- Add positioned image comments that authenticated users can create by clicking directly on an image in the detail modal.
- Add a constrained draft-comment workflow with an immediately visible 100-character limit, keyboard submission, explicit dismissal, and protection against opening multiple drafts at once.
- Add realtime synchronized comment markers so every signed-in viewer sees newly added comments immediately.
- Add hover and pinned comment popups that show the comment author's current name, current assigned color, and comment text.

## Capabilities

### New Capabilities
- `image-comments`: Supports creating, synchronizing, and viewing positioned comments on gallery images inside the image detail modal.

### Modified Capabilities

None.

## Impact

- Affected frontend areas: image detail modal, gallery feature UI state, comment marker and popup presentation.
- Affected backend areas: Convex schema, comment queries/mutations, comment-to-user resolution for live display data.
- Reuses existing authenticated user identity and stable user color assignment.
