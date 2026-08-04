# ScholarPath AdDU Agents Guide


## Purpose
This repository contains ScholarPath AdDU, a React + Vite scholarship discovery, eligibility matching, document vault, application tracking, and admin review prototype for Ateneo de Davao University.


This file is the operating guide for any future coding agent working in this workspace.


## Source Of Truth Priority
When deciding what to change, use this priority order:


1. The manuscript and its stated research objectives, scope, limitations, terminology, and evaluation design.
2. The actual codebase and its current working behavior.
3. Future enhancements or refactors that are not already supported by the manuscript or the current app.


If the manuscript and the codebase conflict, preserve the manuscript intent first and then make the smallest code change that keeps the demo stable.


## Product Context
ScholarPath AdDU is a centralized hybrid web and mobile system for student scholarship discovery and application tracking. The manuscript defines the core system goals as:


- Centralized scholarship discovery across AdDU's financial aid pipelines.
- A Smart Eligibility Checker that evaluates QPI, household income, degree program, and exclusion rules.
- A Document Vault that supports one-time upload and multi-application reuse.
- A notification subsystem for deadline and status alerts.
- Role-based access control for students, OSA administrators, and Department Chairs.
- A polished task-based usability prototype evaluated with ISO/IEC 25010 and SUS.


The manuscript also establishes important scope boundaries that must stay intact:


- The system is discovery, matching, upload, and tracking focused.
- It does not implement actual financial disbursement.
- It does not integrate with the registrar for verified QPI.
- It does not give external scholarship organizations direct administrative access.
- It remains a prototype and must continue to work in demo mode when Supabase is not configured.


## Canonical Manuscript Terms
Use the manuscript language consistently in new code, UI text, documentation, and comments where relevant:


- Smart Eligibility Checker.
- Exclusion Flag Hierarchy.
- Document Vault.
- Dynamic Faceted Search.
- OSA administrators.
- Department Chairs and Coordinators.
- Grant-in-Aid or GIA.
- Financial aid pipelines.
- Application tracking.


Avoid introducing alternate names for the same feature unless the current codebase already uses a different stable label that users see.


## Current Codebase Map
The present implementation is organized as follows:


- `src/App.jsx` is the main state and routing-style coordinator for auth, demo state, theme, profile hydration, and view switching.
- `src/pages/` contains the main screens:
  - `LoginScreen.jsx`
  - `DashboardView.jsx`
  - `ScholarshipExplorer.jsx`
  - `EligibilityChecker.jsx`
  - `ApplicationsAndVault.jsx`
  - `AdminConsole.jsx`
  - `DepartmentReviewView.jsx`
  - `CalendarView.jsx`
  - `SettingsView.jsx`
- `src/components/` contains shared UI building blocks and modal/page-part helpers.
- `src/lib/` contains the domain logic, formatting helpers, auth helpers, eligibility rules, demo data, and Supabase setup.
- `supabase/schema.sql` is the reference schema for backend-aligned work.
- `src/styles.css` defines the visual language, including the current dark-first theme with a light theme override.


## Editing Principles
Follow these rules when making changes:


- Prefer the smallest change that solves the task.
- Reuse existing shared components, helpers, and data shapes instead of duplicating logic.
- Keep demo mode intact unless the task explicitly requires backend integration work.
- Preserve backward compatibility with stored demo state in localStorage.
- Keep Supabase optional and safe when environment variables are missing.
- Do not introduce new dependencies unless they clearly solve the task better than the current stack.
- Do not remove or rewrite manuscript-aligned terminology just to make the code more generic.
- Avoid unnecessary refactors that change behavior, layout, or data shape.


## Domain Rules
These rules come from the manuscript and should guide implementation details:


- Eligibility matching should honor QPI, income, degree program, active status, deadline state, and exclusion logic.
- Specific exclusions must override broad inclusions.
- Scholarship discovery should support faceted filtering and fast search over the current taxonomy.
- Document handling should behave like a normalized vault where the same file can be attached to multiple applications.
- Notifications should remain event-oriented in concept, even if the local demo simulates the behavior.
- Role-based access should preserve student, OSA admin, and Department Chair boundaries.
- The app should continue to feel like a prototype aligned with the study, not a generic scholarship portal.


## UI And UX Expectations
Match the existing design direction unless a task explicitly calls for redesign:


- Keep the interface polished, readable, and consistent with the existing Ateneo blue visual identity.
- Treat every visual change as web and mobile aware; styling should work cleanly on both desktop and handset layouts.
- Preserve responsiveness for desktop and mobile layouts, with mobile-safe spacing, typography, and interaction targets by default.
- Avoid introducing a visually generic dashboard style.
- Keep forms and task flows simple enough for the manuscript's usability-testing narrative.
- When adding visible text, prefer the manuscript's formal research tone and user-facing terminology.


## Data And State Conventions
Use the existing local shapes and patterns already established in the app:


- Demo data should remain compatible with `src/lib/demoData.js`.
- Eligibility logic should remain consistent with `src/lib/eligibility.js`.
- Supabase configuration should continue to route through `src/lib/supabaseClient.js`.
- New persisted state should be additive and guarded so old localStorage entries do not break the app.
- Avoid breaking assumptions in `App.jsx` around `viewerRole`, `activeView`, `profileDraft`, `documents`, `applications`, `notifications`, and `announcements`.


## Safe Implementation Workflow
When working on this repo, use this order:


1. Read the relevant manuscript section first to understand the intended behavior.
2. Inspect the specific code path in the current app.
3. Make the smallest targeted change that aligns code with the manuscript and keeps the demo working.
4. Validate the touched area with the cheapest meaningful check, usually `npm run build`.
5. If the change affects a narrow feature slice, prefer a narrow smoke test or local run before broader validation.


## Validation Expectations
Prefer these checks when appropriate:


- `npm run build` for general validation.
- `npm run dev` for manual review of the local prototype.
- Targeted checks for any touched Supabase, auth, or eligibility logic.


If validation fails, fix the same slice before widening the scope.


## Documentation Expectations
When updating docs or explanatory text:


- Keep the manuscript terminology aligned with the final behavior.
- Preserve the current project framing as a capstone prototype.
- Reflect the actual implemented behavior, not an aspirational feature list.
- If a manuscript statement is no longer true in code, flag it clearly in the change rather than silently changing the meaning.


## Things To Avoid
Do not:


- Add features that imply direct scholarship award allocation or monetary disbursement.
- Turn optional Supabase support into a hard requirement.
- Break demo mode or local state restoration.
- Replace the current domain model with a generic template app model.
- Rename core manuscript concepts without a good reason.
- Make broad styling changes that are unrelated to the task.


## Practical Notes For Future Agents
The most likely high-value work in this repo is feature polishing, manuscript-aligned copy improvements, eligibility logic refinement, document workflow adjustments, and admin/student role behavior updates.


Before any first substantive edit, identify the exact file and behavior being changed, confirm how it relates to the manuscript, and make the smallest edit that preserves the app's demo-first workflow.