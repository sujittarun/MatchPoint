import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../assets/js/progress-data.js", import.meta.url), "utf8");

function engine({ venue = "all", members } = {}) {
  const memory = {};
  const roster = members || Array.from({ length: 12 }, (_, i) => ({
    id: i + 1, name: `Player ${i + 1}`, venue: i === 11 ? "moinabad" : "manikonda",
  }));
  const context = {
    window: {},
    LT: {
      today: () => "2026-07-22",
      store: {
        read: (key, fallback) => key in memory ? JSON.parse(JSON.stringify(memory[key])) : fallback,
        write: (key, value) => { memory[key] = JSON.parse(JSON.stringify(value)); },
      },
      venue: {
        filter: (rows, getVenue) => venue === "all" ? rows : rows.filter((row) => getVenue(row) === venue),
      },
    },
    LT_ROSTER: () => roster,
    console,
    Date,
    JSON,
    Math,
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  return { LTP: context.window.LTP, memory };
}

test("framework contains five progressive levels and 40 observable competencies", () => {
  const { LTP } = engine();
  assert.equal(LTP.levels.length, 5);
  assert.equal(LTP.skills.length, 40);
  assert.deepEqual(Array.from(new Set(LTP.skills.map((s) => s.level))), [1, 2, 3, 4, 5]);
});

test("optional competency never blocks a required promotion gate", () => {
  const { LTP } = engine();
  const player = LTP.profile(8);
  assert.equal(LTP.completion(player), 88);
  assert.equal(LTP.gateCompletion(player), 100);
  assert.equal(LTP.signal(player), "ready");
  assert.equal(LTP.promote(8, "Sowmya Rao").level, 2);
});

test("an incomplete required skill blocks promotion", () => {
  const { LTP } = engine();
  assert.ok(LTP.gateCompletion(LTP.profile(2)) < 100);
  assert.equal(LTP.promote(2, "Sowmya Rao"), null);
});

test("fast learner is detected from repeated level movement, not raw skill count", () => {
  const { LTP } = engine();
  const player = LTP.profile(9);
  assert.ok(LTP.velocity(player) >= 135);
  assert.equal(LTP.signal(player), "ready");
  LTP.setSkill(9, "a-pressure", "not-started");
  assert.equal(LTP.signal(LTP.profile(9)), "fast");
});

test("plateau signal catches overdue assessment even before target duration", () => {
  const { LTP } = engine();
  const player = LTP.profile(2);
  assert.ok(LTP.days(player.lastAssessed) > 45);
  assert.equal(LTP.signal(player), "stalled");
});

test("planned load management is separated from a learning plateau", () => {
  const { LTP } = engine();
  const player = LTP.profile(6);
  assert.equal(player.trainingStatus, "load-managed");
  assert.equal(LTP.signal(player), "managed");
  assert.equal(player.constraints[0].category, "load");
});

test("paused and return-to-play players cannot be promoted", () => {
  for (const status of ["paused", "return-to-play", "exited"]) {
    const { LTP } = engine();
    const required = LTP.levelSkills(1).filter((skill) => skill.core);
    required.forEach((skill) => LTP.setSkill(2, skill.id, "mastered"));
    LTP.setTrainingStatus(2, status);
    assert.equal(LTP.promote(2, "Coach"), null, status);
    assert.equal(LTP.signal(LTP.profile(2)), "managed", status);
  }
});

test("performance-level player cannot be promoted beyond level five", () => {
  const { LTP } = engine();
  LTP.levelSkills(5).filter((skill) => skill.core).forEach((skill) => LTP.setSkill(4, skill.id, "mastered"));
  assert.equal(LTP.promote(4, "Venu Muppala"), null);
});

test("promotion writes a closed history segment and resets current checklist", () => {
  const { LTP } = engine();
  const before = LTP.profile(8);
  const result = LTP.promote(8, "Sowmya Rao");
  assert.equal(result.history.length, before.history.length + 1);
  assert.equal(result.history.at(-1).level, 1);
  assert.equal(result.history.at(-1).to, "2026-07-22");
  assert.equal(result.completed.length, 0);
  assert.equal(result.learning.length, 0);
});

test("venue scope is applied before academy metrics", () => {
  const { LTP } = engine({ venue: "moinabad" });
  const roster = LTP.roster();
  assert.equal(roster.length, 1);
  assert.equal(roster[0].member.id, 12);
});

test("cloud hydration restores assessments, timeline, goals and constraints", () => {
  const members = [{ id: 501, name: "Cloud Player", venue: "manikonda" }];
  const { LTP } = engine({ members });
  const hydrated = LTP.hydrateCloud({
    progress: [{ member_id: 501, current_level: 2, level_since: "2026-06-01", training_status: "load-managed", primary_coach_name: "Coach A", last_assessed_at: "2026-07-20T10:00:00Z", framework_version: 1 }],
    assessments: [{ member_id: 501, framework_version: 1, skill_id: "d-split", state: "mastered" }],
    history: [{ member_id: 501, level: 1, started_on: "2026-01-01", completed_on: "2026-06-01", approved_by_name: "Coach A" }],
    notes: [{ member_id: 501, note: "Cloud note", noted_at: "2026-07-20T10:00:00Z" }],
    goals: [{ id: 91, member_id: 501, goal: "Improve recovery", target_on: "2026-08-01", status: "active" }],
    constraints: [{ id: 92, member_id: 501, category: "medical", summary: "Gradual return", review_on: "2026-08-02" }],
  });
  const player = LTP.profile(501);
  assert.equal(hydrated, true);
  assert.equal(player.level, 2);
  assert.deepEqual(Array.from(player.completed), ["d-split"]);
  assert.equal(player.history[0].level, 1);
  assert.equal(player.goals[0].id, 91);
  assert.equal(player.constraints[0].summary, "Gradual return");
});

test("goals can be completed and reopened without losing target date", () => {
  const { LTP } = engine();
  const created = LTP.addGoal(1, "Win 7/10 serve returns", "2026-08-15", 2001);
  assert.equal(created.goals[0].status, "active");
  assert.equal(LTP.toggleGoal(1, 2001).goals[0].status, "achieved");
  const reopened = LTP.toggleGoal(1, 2001).goals[0];
  assert.equal(reopened.status, "active");
  assert.equal(reopened.targetOn, "2026-08-15");
});

test("coach support records preserve load, session and review decisions", () => {
  const { LTP } = engine();
  let player = LTP.addConstraint(1, "movement", "Reduce deep lunges", "2026-08-01", 3001);
  assert.equal(player.trainingStatus, "load-managed");
  assert.equal(player.constraints[0].id, 3001);
  player = LTP.addObservation(1, "Rear-court recovery", 4, 3, "Quality dipped late", 3002);
  assert.equal(player.observations[0].movementQuality, 3);
  player = LTP.addReview(1, "adjust-plan", "2026-09-05", "Change weekly focus", 3003);
  assert.equal(player.reviewDue, "2026-09-05");
  assert.equal(player.lastAssessed, "2026-07-22");
  assert.equal(LTP.closeConstraint(1, 3001).constraints.length, 0);
});

test("pause review changes eligibility while adjust-plan retains managed state", () => {
  const { LTP } = engine();
  let player = LTP.addReview(8, "pause", "2026-09-01", "Planned break", 4001);
  assert.equal(player.trainingStatus, "paused");
  assert.equal(LTP.signal(player), "managed");
  assert.equal(LTP.promote(8, "Coach"), null);
});
