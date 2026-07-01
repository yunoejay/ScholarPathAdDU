# Copilot Instructions for ScholarPath AdDU

## Project context
- This repository is a React + Vite single-page application for scholarship discovery, eligibility checking, applications, and admin review.
- Keep changes aligned with the existing app structure:
  - UI pages belong in src/pages.
  - Reusable UI pieces belong in src/components.
  - Shared logic, formatting helpers, and constants belong in src/lib.

## Product and UX expectations
- Preserve the current demo-first experience. Core UI flows should continue to work even when Supabase credentials are not configured.
- Keep the interface polished, simple, and consistent with the existing styling in src/styles.css.
- Reuse existing shared components such as Card, StatCard, EmptyState, and ScholarshipRow where possible instead of introducing duplicate UI patterns.

## Code conventions
- Prefer functional React components and straightforward state updates.
- Reuse existing helpers and formatters from src/lib rather than creating duplicate logic.
- Keep new data aligned with the shapes already used in src/lib/demoData.js.
- Avoid adding unnecessary dependencies; favor lightweight React/Vite solutions.

## Working style
- Make minimal, targeted changes that preserve the existing experience unless the user explicitly requests broader refactoring.
- Prefer safe, reversible edits and keep demo-mode functionality intact.
- When unsure, preserve current behavior and ask for clarification rather than introducing a new pattern.

## Backend and data handling
- If Supabase integration is touched, keep it optional and safe when environment variables are missing.
- Preserve compatibility with the existing local demo-state pattern in App.jsx.
- When introducing new app state or data fields, keep them backward-compatible with the current seed data and stored state structure.
