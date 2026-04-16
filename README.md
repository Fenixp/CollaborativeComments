# Collaborative Comments

A real-time collaborative image review tool. Upload images, drop pinned comments at exact coordinates, and see your teammates' cursors move live — all in the browser, no plugins required.

**Live app:** [davidcomments.eu](https://davidcomments.eu)

---

## How to use

### Signing in

Visit [davidcomments.eu](https://davidcomments.eu) and create an account or sign in. Each account is assigned a unique colour used to identify your comments and cursor to other collaborators.

### Uploading images

From the gallery, click **Upload** and select an image file (JPEG, PNG, GIF, WebP, etc., up to 2 MB). The image appears in the shared gallery immediately for everyone logged in.

### Leaving comments

Open any image to enter the detail view. Click anywhere on the image to pin a comment at that spot. Comments are limited to 100 characters and are visible to all team members in real time.

### Live cursors

While viewing the same image as your teammates, their cursors appear as colour-coded arrows labelled with their name. Cursors update continuously as people move around the image.

### Deleting images

Images you uploaded can be deleted from the gallery view. Deletion removes the image along with all its comments.

### Account settings

Click your avatar in the top bar to reach account settings, where you can manage your profile.

---

## Technical stack

| Layer | Technology |
|---|---|
| Frontend framework | SvelteKit 2 + TypeScript |
| Styling | Tailwind CSS v4 |
| UI components | shadcn-svelte, Lucide icons |
| Backend / database | Self-hosted [Convex](https://convex.dev) (SQLite) |
| Real-time | Convex reactive queries and subscriptions |
| Authentication | [Clerk](https://clerk.com) |
| File storage | Convex built-in object storage |
| Infrastructure | Docker Compose, Traefik (TLS termination) |
| CI/CD | GitHub Actions — SSH deploy on push to `main` |
