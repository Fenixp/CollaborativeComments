## Why

Users currently get no cursor-level feedback that the image is in text-entry mode after they start composing a comment. Changing the pointer to an edit-style cursor while a comment draft is active will make the drafting state more obvious and reduce ambiguity during comment placement.

## What Changes

- Update image comment drafting behavior so the image/detail experience switches to an edit cursor while a comment draft is open for text entry.
- Restore the normal cursor when no draft is active or the draft is dismissed/submitted.
- Keep the cursor change scoped to the comment-writing interaction so existing marker hover, modal, and gallery behaviors remain unchanged.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `image-comments`: add a requirement that active comment drafting shows an edit-style cursor until the draft is completed or dismissed.

## Impact

- Affected spec: `openspec/specs/image-comments/spec.md`
- Likely affected frontend code in the image detail modal and comment draft interaction components under `src/lib/features/` and shared image comment UI layers.
- No expected backend, API, auth, or dependency changes.
