# ScholarPath AdDU

A React + Vite and Supabase webapp for our ScholarPath AdDU capstone.

## What’s included
- Scholarship discovery with faceted search
- Smart Eligibility Checker based on QPI, income, degree, and exclusion rules
- Application tracker
- Reusable document vault
- OSA admin console
- Department chair review view
- Polished local demo data for frontend review

## Run locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```

## Backend-ready setup
- Copy `.env.example` to `.env` when you're ready to connect Supabase.
- Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project settings.
- The app will stay in local demo mode until those values are provided.
- `src/lib/supabaseClient.js` already safely returns `null` when Supabase is not configured.

## Notes
- The app currently uses manuscript-aligned demo data in the UI.
- Backend work is intentionally deferred until the front end is polished.
- `supabase/schema.sql` is kept as a future reference for the next phase.
