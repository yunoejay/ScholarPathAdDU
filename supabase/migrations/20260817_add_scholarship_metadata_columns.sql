-- Add manuscript-only metadata columns for the eligibility engine and UI.
-- These are additive and safe to run on the existing scholarships table.

-- Make QPI/income nullable so honors, A-1, government-linked, and work-study
-- entries (which have no QPI/income gate) can store NULL.
alter table public.scholarships alter column minimum_qpi drop not null;
alter table public.scholarships alter column maximum_income drop not null;

-- Make deadline nullable so external / donor programs with no AdDU deadline
-- can store NULL (UI already renders these as "Rolling / TBA").
alter table public.scholarships alter column deadline drop not null;

-- Manuscript-only metadata columns.
alter table public.scholarships add column if not exists rule_family text;
alter table public.scholarships add column if not exists gov_program text;
alter table public.scholarships add column if not exists is_matchable boolean not null default true;
alter table public.scholarships add column if not exists application_route text;
alter table public.scholarships add column if not exists is_external boolean not null default false;
alter table public.scholarships add column if not exists appendix_number integer;

-- Unique title so the seed upsert (on_conflict=title) is idempotent.
create unique index if not exists scholarships_title_key on public.scholarships (title);