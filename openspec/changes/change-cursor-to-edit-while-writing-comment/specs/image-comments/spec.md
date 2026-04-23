## ADDED Requirements

### Requirement: Active comment drafts show an edit-style cursor
The system SHALL show an edit-style cursor over the image comment interaction area while an authenticated user has an active comment draft open in the image detail modal, and SHALL restore the normal cursor when that draft is no longer active.

#### Scenario: Opening a draft enables the edit cursor
- **WHEN** an authenticated user opens a comment draft in the image detail modal
- **THEN** the system shows an edit-style cursor over the image comment interaction area for the duration of that active draft

#### Scenario: Closing a draft restores the default cursor
- **WHEN** the authenticated user's active comment draft is submitted or dismissed
- **THEN** the system restores the non-edit cursor for the image comment interaction area
