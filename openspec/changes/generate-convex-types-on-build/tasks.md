## 1. Dockerfile

- [ ] 1.1 Add `ENV CONVEX_SELF_HOSTED_URL=http://localhost:3210` to the build stage before the codegen step
- [ ] 1.2 Add `RUN npx convex codegen` after `COPY . .` and before `RUN npm run build`

## 2. Git Hygiene

- [ ] 2.1 Re-add `src/convex/_generated/` to `.gitignore`
- [ ] 2.2 Remove the generated files from git tracking: `git rm -r --cached src/convex/_generated/`

## 3. Verification

- [ ] 3.1 Run `docker build .` locally and confirm it succeeds without pre-existing `_generated/` files
- [ ] 3.2 Confirm `git status` does not list `src/convex/_generated/` as tracked or untracked
