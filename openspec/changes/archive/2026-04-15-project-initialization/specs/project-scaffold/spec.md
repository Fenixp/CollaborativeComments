## ADDED Requirements

### Requirement: The project provides a runnable scaffold for SvelteKit and self-hosted Convex
The system SHALL initialize a SvelteKit frontend, a Convex project structure, and Docker Compose configuration that supports running the application shell with self-hosted Convex services.

#### Scenario: Project bootstrap is created
- **WHEN** the scaffold is implemented
- **THEN** the repository contains the initialized frontend project, Convex project files, and Docker Compose configuration required for the shell application

### Requirement: The frontend includes the agreed styling and component foundations
The system SHALL initialize Tailwind CSS, shadcn-svelte, Lucide icons, and the agreed atomic-design-oriented folder structure.

#### Scenario: Frontend foundations are present
- **WHEN** a developer inspects the initialized frontend structure
- **THEN** the project contains Tailwind configuration, shadcn-svelte setup, Lucide dependency, and the baseline component directories for `ui`, atomic design layers, and features

### Requirement: The scaffold avoids product business logic
The system SHALL stop at shell-level setup and SHALL NOT include image upload, comment, or other product-specific business functionality in this change.

#### Scenario: Scope boundary is preserved
- **WHEN** the scaffold change is completed
- **THEN** the project contains setup and shell behavior only, with product business logic deferred to future changes
