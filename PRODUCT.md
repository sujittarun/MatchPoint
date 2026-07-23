# Product

## Register

product

## Users

Front-desk staff, coaches and the academy manager at Match Point Badminton
Academy (Manikonda, Hyderabad). They are not tech-savvy; they use the manager
between coaching sessions, at the front desk, and on their phones courtside.
Their job: mark attendance, take bookings, collect fees, track member renewals,
and record player skill progress — quickly, without training or a manual.

## Product Purpose

"Academy OS" — the staff-facing manager for the Match Point tenant of a shared
multi-tenant academy platform (Supabase-backed, local-first). Success = a coach
or desk staffer can complete any daily task (mark present, confirm a court,
record a fee, sign off a skill) in seconds, on the first try, on any device.

## Brand Personality

Calm, capable, encouraging. The visual identity (graphite + chartreuse
"Liquid Glass") stays — it is the brand. Simplicity is delivered through UX:
Apple-like ease of use, obvious buttons, plain language, one clear primary
action per screen. The tool should feel like it was made for coaches, not
accountants.

## Anti-references

- Dense admin dashboards (rows of tiny filters, cryptic abbreviations,
  ten equal-weight buttons per card).
- Enterprise CRUD screens that need training to operate.
- Decorative effects that compete with the task (the brand glass look is kept,
  but never at the cost of legibility or tap accuracy).

## Design Principles

1. **One obvious next action.** Every screen leads with the single thing staff
   most likely came to do; everything else is secondary or tucked away.
2. **Plain words, no jargon.** Labels say what happens ("Mark paid", "Add
   member"), never system-speak ("Sync channel state").
3. **Thumb-first.** Staff are often on phones courtside — big touch targets
   (≥44px), bottom-reachable actions, forgiving spacing.
4. **Show state, don't make them remember.** Paid/due, present/absent,
   confirmed/pending are always visible at a glance via consistent
   color-coded chips.
5. **Keep the identity, cut the noise.** Brand glass stays; per-screen clutter,
   redundant stats and equal-weight button rows go.

## Accessibility & Inclusion

- Touch targets ≥44px on all interactive controls.
- Body text ≥4.5:1 contrast in both themes (audit the dark glass ink ramp).
- `prefers-reduced-motion` honored for reveals, count-ups and hover glows.
- English UI, simple vocabulary (staff may read English as a second language).
