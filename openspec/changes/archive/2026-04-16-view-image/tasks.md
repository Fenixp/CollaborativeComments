## 1. Gallery selection wiring and affordance

- [x] 1.1 Make gallery image cards expose selection intent when a user activates an existing image, including a subtle hover affordance that communicates clickability.
- [x] 1.2 Thread image-selection handling through the gallery grid into `gallery-experience.svelte`.

## 2. Image detail modal

- [x] 2.1 Add gallery-owned selected-image state and open/close handlers in `gallery-experience.svelte` without interfering with the existing upload modal state.
- [x] 2.2 Implement the image detail modal with a larger image-focused layout, viewport-constrained image sizing, a close button, and an OK button.
- [x] 2.3 Support dismissal through the same interaction pattern as the existing modal, including Escape and backdrop click.

## 3. Verification

- [x] 3.1 Verify that clicking an existing gallery image opens the correct image in the detail modal.
- [x] 3.2 Verify that the displayed image keeps its aspect ratio while filling as much of the available modal area as possible.
- [x] 3.3 Verify that Close, OK, Escape, and backdrop click all dismiss the modal and return the user to the gallery view.
- [x] 3.4 Verify that hovering an existing gallery image shows a subtle visual affordance indicating it can be opened.
