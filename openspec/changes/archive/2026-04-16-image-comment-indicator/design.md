## Context

The gallery currently displays image thumbnails with no indication of community activity. The comment system exists (image-comments spec) and stores comments per image in Convex, but the gallery view (`gallery-experience.svelte`) has no connection to comment data. Users must open each image individually to discover whether it has any comments.

## Goals / Non-Goals

**Goals:**
- Show a comment count badge overlaid on each gallery thumbnail
- Reactively update the count when a new comment is added (Convex live query)
- Briefly flash/animate the badge when its count increases
- Zero-comment images show no badge (or a hidden/zero state)

**Non-Goals:**
- Showing who commented or any comment preview text in the badge
- Pagination or filtering by comment count
- Showing the indicator inside the detail modal (it already has comment markers)
- Supporting comment counts for non-authenticated users

## Decisions

### 1. Fetch counts via a dedicated Convex query, not by extending the images query

The existing gallery query returns image metadata. Joining comment counts server-side couples two otherwise independent data shapes and makes the gallery query more expensive whenever comments change.

Instead, a new `getCommentCountsByImageId` Convex query returns a map of `{ [imageId]: number }`. The gallery component subscribes to both queries; counts are looked up client-side by image ID.

**Alternative considered**: Embed count in the image document via a denormalized field updated on every comment mutation. Rejected because it adds write-time complexity and makes the comment module aware of the gallery data model.

### 2. Flash animation is driven by a Svelte reactive statement, not a store

When the count for an image increases, a short CSS animation class is temporarily added to that badge element. A `setTimeout` removes the class after the animation duration. This is self-contained inside the gallery component with no additional state management.

**Alternative considered**: A writable store keyed by image ID. Overkill for a transient visual effect.

### 3. Badge is positioned absolute inside a relative-positioned card wrapper

Gallery cards already have a wrapper element. The badge is `position: absolute; bottom: 8px; right: 8px` inside that wrapper, overlaid on the thumbnail. This requires no layout changes to sibling elements.

## Risks / Trade-offs

- **Count momentarily stale on first load** → Convex live query resolves quickly; no skeleton/loading state needed for a count badge
- **Flash triggers on initial mount if count > 0** → Guard the animation: only flash when a count *increases* from a previously known value, not on first render
- **Many images with comments increase subscription cost** → Acceptable at current scale; one query returning all counts is cheaper than N per-image queries

## Migration Plan

No data migration needed. The new Convex query reads existing comment data. The badge is purely additive UI. Deploy in a single release; no rollback complexity.
