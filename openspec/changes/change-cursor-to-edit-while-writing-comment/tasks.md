## 1. Update draft-driven cursor behavior

- [ ] 1.1 Locate the image comment draft state in the image detail modal flow and identify the interaction container that should own cursor styling.
- [ ] 1.2 Bind an edit-style cursor to the image comment interaction area whenever an active comment draft exists.
- [ ] 1.3 Restore the normal cursor automatically when the draft is submitted or dismissed.

## 2. Preserve existing comment interactions

- [ ] 2.1 Confirm the cursor change stays scoped to the comment-writing surface and does not affect unrelated modal or gallery interactions.
- [ ] 2.2 Review the implementation paths for single-draft, submit, and dismiss flows to ensure the cursor state follows the existing draft lifecycle without adding duplicate state.
