# ScholarPath AdDU

A React + Vite and Supabase webapp for our ScholarPath AdDU capstone.

## What’s included
- Scholarship discovery with faceted search
- Smart Eligibility Checker based on QPI, income, degree, and exclusion rules
- Application tracker
- Reusable document vault
- OSA admin console
- Department chair review view

## Authentication redirect configuration

Google sign-in, password reset links, and account confirmation emails all return
the browser to a URL that Supabase Auth must have allow-listed. When the
requested URL is not allow-listed, Supabase Auth silently substitutes its
project Site URL, which is the default `http://localhost:3000` for a fresh
project. That is why an unconfigured project sends the deployed prototype back
to localhost after Google sign-in.

In the Supabase dashboard, under **Authentication → URL Configuration**:

- **Site URL**: the deployed prototype origin, for example `https://scholarpath-addu.vercel.app`
- **Redirect URLs**: the deployed origin with a wildcard path (`https://scholarpath-addu.vercel.app/**`), a scoped wildcard for preview deployments such as `https://scholarpath-addu*.vercel.app/**`, and the local development origins `http://localhost:5173/**` and `http://127.0.0.1:5173/**`

Under **Authentication → Providers → Google**, the Google Cloud OAuth client must
list `https://<project-ref>.supabase.co/auth/v1/callback` as an authorized
redirect URI.

Optional: set `VITE_SITE_URL` in the deployed environment (see `.env.example`)
to make every build return to one canonical origin. Leave it unset locally so
local development signs in against `http://localhost:5173`.
