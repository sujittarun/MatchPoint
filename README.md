# Match Point Academy OS

Pitch-ready public website and academy manager for Match Point Badminton
Academy, Manikonda, Hyderabad.

## Run locally

No build step is required:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Demo manager access

This repository is intentionally configured as a client pitch demo. The manager
login is prefilled in `login.html`:

- Email: `staff@matchpointacademy.in`
- Password: `MatchPoint!NextLevel#2026`

Replace this account and remove the prefilled password before a production
handoff.

## Product surfaces

- `index.html` — editorial public landing page
- `booking.html` — live hourly court request flow
- `admission.html` — coaching enrolment wizard
- `login.html` — staff sign-in
- `dashboard.html` — daily operations overview
- `players.html` — member CRM and renewals
- `progress.html` — skill sign-offs, player level histories, fast-learner and plateau detection
- `bookings.html` — court board and channel sync
- `attendance.html` — member and staff attendance
- `fees.html` — revenue, expense and dues tracking
- `pay.html` — UPI collection hand-off

The app is local-first and fails soft when the shared Supabase project is not
available. `assets/js/cloud.js` carries the production API seam and tenant id.

## Tenant model

The tenant id is `matchpoint`. Records are venue-keyed with the active venue
`manikonda`; this keeps a second venue additive rather than requiring a tenant
split. Review `supabase/migration-matchpoint.sql` before applying it to the
shared Academy Manager project.

## Player-development model

The progression module uses five coach-approved stages: Foundation, Developing,
Intermediate, Advanced and Performance. Each stage contains observable
competencies across movement, strokes, serve/receive, tactics, physical
preparation and match craft. Skills move through `not-started`, `learning` and
`mastered`; completing a checklist enables a coach promotion review but never
promotes a player automatically.

The manager UI remains local-first for offline continuity, then hydrates from
Supabase for authenticated Match Point staff. Provision in this order:

1. `supabase/migration-matchpoint.sql`
2. `supabase/player-progress-matchpoint.sql`
3. `supabase/seed-matchpoint-progress-scenarios.sql` (optional pitch fixtures)

The last file creates only fictional rows marked `is_demo=true`. Operational
definitions and safety rules are in
`docs/player-development-operations.md`; run `node --test
tests/progress-scenarios.test.mjs` for the progression scenario suite.
