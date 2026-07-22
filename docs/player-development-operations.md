# Match Point player-development operations

## What the system answers

- Who is progressing unusually fast, based on completed-level duration rather than raw checkbox count?
- Who is promotion-ready because every **required** competency at the current level is mastered?
- Who may be plateauing because the level target or review date is overdue?
- Who is intentionally paused, load-managed, or returning to play and must not be labelled a slow learner?
- Which coach has overdue reviews, incomplete assessment coverage, or promotion decisions waiting?

## Coach workflow

1. Set the player's current training status and any operational constraint.
2. After a session, record observable effort/movement evidence and update competencies.
3. Maintain one or more specific, time-bound development goals.
4. Complete a formal review and set the next review date.
5. Promote only when required skills are mastered and a coach approves the move.

Promotion is atomic in PostgreSQL: it locks the player row, validates the one-level move, checks training eligibility and the versioned competency gate, closes the current history segment, and opens the next segment.

## Signal definitions

- **Ready:** all required current-level skills mastered; optional enrichments do not block the gate.
- **Fast:** completed-level pace index is at least 135% of the academy target pace.
- **Needs attention:** review overdue, or level duration exceeds 120% of target while required completion is under 80%.
- **Managed:** load-managed, paused, return-to-play, or exited; kept separate from learning performance.
- **On track:** none of the above.

Signals prioritise a coach's attention. They are not rankings, diagnoses, or automatic promotion decisions.

## Academy-manager controls

- Coach assignment and 30-day assessment coverage.
- Overdue review and promotion-review queues.
- Level distribution, average move time, and pace index.
- Venue-scoped roster and attendance context.
- Immutable assessment-event history for accountability.
- Versioned frameworks so historical records retain their original meaning.

## Data and safety rules

- Player-development tables are tenant-scoped and protected with row-level security.
- Anonymous users cannot read any development row.
- Medical documents or diagnoses do not belong here. Store only the operational modification coaches need and a review date.
- Minors' development information stays inside the manager console; the public landing story remains anonymised.
- Demo members are explicitly marked `is_demo=true` and can be removed before launch without touching real players.

## Scenario fixtures

`supabase/seed-matchpoint-progress-scenarios.sql` creates nine fictional players covering accelerated learning, plateau, promotion readiness, performance pathway, managed load, return-to-play, new starter, transfer placement, and planned pause. The seed is deterministic and resets only Match Point rows marked as demo data.
