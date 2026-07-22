/* Match Point — player development framework and local-first progression engine. */
(function () {
  "use strict";

  var levels = [
    { id: 1, name: "Foundation", short: "L1", targetDays: 90, colour: "#c9ff35", summary: "Safe movement, clean contact and rally confidence" },
    { id: 2, name: "Developing", short: "L2", targetDays: 110, colour: "#64d9cb", summary: "Reliable recovery and controlled stroke choices" },
    { id: 3, name: "Intermediate", short: "L3", targetDays: 135, colour: "#8f8bff", summary: "Build patterns, defend pressure and create space" },
    { id: 4, name: "Advanced", short: "L4", targetDays: 165, colour: "#ff9c33", summary: "Explosive attack, deception and tactical adaptation" },
    { id: 5, name: "Performance", short: "L5", targetDays: 210, colour: "#ff6f91", summary: "Individual tournament system and repeatable performance" }
  ];

  function skill(id, level, category, name, cue, core) {
    return { id: id, level: level, category: category, name: name, cue: cue, core: core !== false };
  }

  var skills = [
    skill("f-grip",1,"Technique","Forehand & backhand grip","Changes grip without looking"),
    skill("f-ready",1,"Movement","Ready stance & split step","Balanced as opponent strikes"),
    skill("f-lunge",1,"Movement","Lunge and recover","Knee aligned; returns to base"),
    skill("f-lift",1,"Strokes","Underarm lift","High contact to rear tramlines"),
    skill("f-clear",1,"Strokes","Overhead clear","Side-on action; reaches rear court"),
    skill("f-serve",1,"Serve / receive","Short serve","Legal, repeatable low trajectory"),
    skill("f-rally",1,"Match craft","Cooperative 10-shot rally","Controls direction and tempo"),
    skill("f-rules",1,"Match craft","Scoring & court rules","Scores and positions independently",false),

    skill("d-split",2,"Movement","Timed split step","Lands as opponent contacts"),
    skill("d-six",2,"Movement","Six-corner shadow","Efficient chasse, crossover and recovery"),
    skill("d-clear",2,"Strokes","Directional clear","Straight and cross-court depth"),
    skill("d-drop",2,"Strokes","Basic drop shot","Same preparation as clear"),
    skill("d-net",2,"Strokes","Net shot & recovery","Tight trajectory; racket remains high"),
    skill("d-serve",2,"Serve / receive","Long serve & return","Selects response by flight"),
    skill("d-drive",2,"Serve / receive","Drive exchange","Compact action in front of body"),
    skill("d-pattern",2,"Match craft","Clear–drop movement pattern","Recovers and repeats under control"),

    skill("i-smash",3,"Attack","Smash technique","Contact in front; steep controlled finish"),
    skill("i-block",3,"Defence","Smash block defence","Absorbs pace straight and cross"),
    skill("i-backhand",3,"Strokes","Backhand clear","Sound grip change and rotation"),
    skill("i-netkill",3,"Attack","Net kill & interception","Takes shuttle early without touching net"),
    skill("i-push",3,"Strokes","Mid-court push","Creates space past front player"),
    skill("i-single",3,"Tactics","Singles base & construction","Moves opponent before attacking"),
    skill("i-double",3,"Tactics","Doubles rotation","Transitions attack–defence with partner"),
    skill("i-condition",3,"Physical","Repeat-footwork capacity","Maintains quality across six sets"),

    skill("a-jump",4,"Attack","Jump smash","Stable take-off, contact and landing"),
    skill("a-slice",4,"Attack","Slice & reverse-slice drop","Same preparation; controlled deception"),
    skill("a-spin",4,"Front court","Tumbling net shot","Takes early and forces lift"),
    skill("a-counter",4,"Defence","Counter-attack defence","Converts block or drive into initiative"),
    skill("a-return",4,"Serve / receive","Pressure return patterns","Four reliable doubles returns"),
    skill("a-rotate",4,"Tactics","Rear/front court rotation","Reads partner and closes space"),
    skill("a-scan",4,"Tactics","Opponent pattern recognition","Names and exploits two tendencies"),
    skill("a-pressure",4,"Match craft","Pressure routine","Resets consistently between rallies"),

    skill("p-plan",5,"Competition","Individual game model","Defined strengths, patterns and constraints"),
    skill("p-video",5,"Competition","Video self-analysis","Tags errors, winners and rally phases"),
    skill("p-scout",5,"Tactics","Opponent scouting","Builds a practical pre-match plan"),
    skill("p-multi",5,"Physical","Multi-shuttle speed endurance","Sustains movement and stroke quality"),
    skill("p-load",5,"Physical","Training-load awareness","Reports readiness and recovery honestly"),
    skill("p-sim",5,"Competition","Tournament simulation","Executes routines under score pressure"),
    skill("p-mental",5,"Match craft","Focus & emotional reset","Returns to process after errors"),
    skill("p-recovery",5,"Physical","Recovery habits","Sleep, hydration and nutrition plan",false)
  ];

  function completed(level, count) {
    return skills.filter(function (s) { return s.level === level; }).slice(0, count).map(function (s) { return s.id; });
  }

  var seed = {
    1:{level:4,levelSince:"2026-03-11",coach:"Karthik Reddy",completed:completed(4,6),learning:["a-scan"],lastAssessed:"2026-07-18",history:[{level:1,from:"2025-08-05",to:"2025-09-26"},{level:2,from:"2025-09-26",to:"2025-12-01"},{level:3,from:"2025-12-01",to:"2026-03-11"}],notes:["Fast tactical uptake. Build more patience before the first attack."]},
    2:{level:1,levelSince:"2026-03-01",coach:"Sowmya Rao",completed:completed(1,5),learning:["f-serve"],lastAssessed:"2026-06-02",history:[],notes:["Grip change is improving. Needs a smaller final step into the forecourt."]},
    3:{level:3,levelSince:"2026-06-01",coach:"Karthik Reddy",completed:completed(3,5),learning:["i-single","i-double"],lastAssessed:"2026-07-14",history:[{level:1,from:"2026-01-18",to:"2026-03-08"},{level:2,from:"2026-03-08",to:"2026-06-01"}],notes:["Strong defender; developing intent in the first three shots."]},
    4:{level:5,levelSince:"2026-04-06",coach:"Venu Muppala",completed:completed(5,5),learning:["p-sim"],lastAssessed:"2026-07-20",history:[{level:1,from:"2025-06-02",to:"2025-07-25"},{level:2,from:"2025-07-25",to:"2025-09-22"},{level:3,from:"2025-09-22",to:"2025-12-12"},{level:4,from:"2025-12-12",to:"2026-04-06"}],notes:["Tournament plan: protect the forehand rear corner under fatigue."]},
    5:{level:1,levelSince:"2026-04-18",coach:"Sowmya Rao",completed:completed(1,4),learning:["f-clear","f-serve"],lastAssessed:"2026-06-16",history:[],notes:["Clean contact when stationary. Movement-to-contact is the current priority."]},
    6:{level:2,levelSince:"2026-02-10",coach:"Venu Muppala",trainingStatus:"load-managed",completed:completed(2,7),learning:["d-pattern"],lastAssessed:"2026-07-10",history:[{level:1,from:"2025-12-01",to:"2026-02-10"}],goals:[{id:"g6-1",text:"Complete six-corner movement at controlled volume",targetOn:"2026-08-10",status:"active"}],constraints:[{category:"load",summary:"Reduce repeated overhead volume while shoulder settles",reviewOn:"2026-08-01"}],notes:["Ready for a coach review after completing the movement pattern under pressure."]},
    7:{level:3,levelSince:"2026-01-30",coach:"Karthik Reddy",completed:completed(3,4),learning:["i-push"],lastAssessed:"2026-05-20",history:[{level:1,from:"2025-10-22",to:"2025-11-29"},{level:2,from:"2025-11-29",to:"2026-01-30"}],notes:["Plateau flag: schedule a one-to-one technical review on backhand rear court."]},
    8:{level:1,levelSince:"2026-05-12",coach:"Sowmya Rao",completed:completed(1,7),learning:["f-rules"],lastAssessed:"2026-07-19",history:[],notes:["Excellent movement learner. Ready for a pathway review."]},
    9:{level:4,levelSince:"2026-02-15",coach:"Venu Muppala",completed:completed(4,8),learning:[],lastAssessed:"2026-07-21",history:[{level:1,from:"2025-11-10",to:"2025-12-01"},{level:2,from:"2025-12-01",to:"2025-12-28"},{level:3,from:"2025-12-28",to:"2026-02-15"}],notes:["Promotion review passed technically. Confirm competition schedule before moving to Performance."]},
    10:{level:3,levelSince:"2026-05-09",coach:"Karthik Reddy",completed:completed(3,7),learning:["i-condition"],lastAssessed:"2026-07-17",history:[{level:1,from:"2026-02-15",to:"2026-03-10"},{level:2,from:"2026-03-10",to:"2026-05-09"}],notes:["Fast learner with excellent transfer from drills to match play."]},
    11:{level:2,levelSince:"2026-05-24",coach:"Venu Muppala",completed:completed(2,5),learning:["d-serve"],lastAssessed:"2026-07-12",history:[{level:1,from:"2026-04-20",to:"2026-05-24"}],notes:["Adult personal track. Prioritise efficient movement and shoulder-safe volume."]},
    12:{level:4,levelSince:"2026-07-02",coach:"Venu Muppala",completed:completed(4,5),learning:["a-rotate","a-scan"],lastAssessed:"2026-07-20",history:[{level:3,from:"2026-06-15",to:"2026-07-02"}],notes:["Placed into the advanced pathway after assessment; validate under tournament match conditions."]}
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function days(a, b) { return Math.max(1, Math.round((new Date(b || LT.today()) - new Date(a)) / 864e5)); }
  function saved() { return LT.store.read("player-progress", {}); }
  function profile(id) {
    var base = clone(seed[id] || { level:1, levelSince:LT.today(), coach:"Unassigned", trainingStatus:"active", completed:[], learning:[], lastAssessed:LT.today(), history:[], goals:[], notes:[] });
    if (!base.trainingStatus) base.trainingStatus = "active";
    if (!base.goals) base.goals = [];
    var override = saved()[id];
    return override ? Object.assign(base, override) : base;
  }
  function put(id, value) { var all = saved(); all[id] = value; LT.store.write("player-progress", all); }
  function levelSkills(level) { return skills.filter(function (s) { return s.level === Number(level); }); }
  function completion(p, requiredOnly) {
    var list = levelSkills(p.level).filter(function (s) { return !requiredOnly || s.core; }), done = p.completed || [];
    return list.length ? Math.round(done.filter(function (id) { return list.some(function (s) { return s.id === id; }); }).length / list.length * 100) : 0;
  }
  function gateCompletion(p) { return completion(p,true); }
  function velocity(p) {
    var durations = (p.history || []).map(function (h) { return days(h.from,h.to); });
    if (durations.length >= 2) {
      var actual = durations.reduce(function (a,b) { return a+b; },0) / durations.length;
      var expected = (p.history || []).reduce(function (a,h) { return a + levels[h.level-1].targetDays; },0) / durations.length;
      return Math.max(45, Math.min(200, Math.round(expected / actual * 100)));
    }
    var elapsed = days(p.levelSince), pct = Math.max(completion(p),10);
    var estimate = elapsed / (pct/100), target = levels[p.level-1].targetDays;
    return Math.max(45, Math.min(200, Math.round(target / estimate * 100)));
  }
  function signal(p) {
    var pct = completion(p), elapsed = days(p.levelSince), target = levels[p.level-1].targetDays;
    var sinceAssessment = days(p.lastAssessed);
    if (p.trainingStatus !== "active") return "managed";
    if (gateCompletion(p) >= 100 && p.level < 5) return "ready";
    if ((elapsed > target * 1.2 && pct < 80) || sinceAssessment > 45) return "stalled";
    if (velocity(p) >= 135) return "fast";
    return "on-track";
  }
  function roster() {
    return LT.venue.filter(LT_ROSTER(), function (m) { return m.venue; }).map(function (m) {
      var p = profile(m.id);
      return { member:m, profile:p, pct:completion(p), gatePct:gateCompletion(p), days:days(p.levelSince), velocity:velocity(p), signal:signal(p), level:levels[p.level-1] };
    });
  }
  function setSkill(memberId, skillId, state) {
    var p = profile(memberId), done = p.completed || [], learning = p.learning || [];
    done = done.filter(function (id) { return id !== skillId; });
    learning = learning.filter(function (id) { return id !== skillId; });
    if (state === "mastered") done.push(skillId);
    if (state === "learning") learning.push(skillId);
    p.completed = done; p.learning = learning; p.lastAssessed = LT.today();
    put(memberId,p); return p;
  }
  function addNote(memberId, note) {
    var p = profile(memberId); p.notes = p.notes || [];
    p.notes.unshift(note); p.lastAssessed = LT.today(); put(memberId,p); return p;
  }
  function setTrainingStatus(memberId, status) {
    var allowed=["active","load-managed","paused","return-to-play","exited"];
    if (allowed.indexOf(status)===-1) return profile(memberId);
    var p=profile(memberId); p.trainingStatus=status; p.lastAssessed=LT.today();
    p.notes=p.notes||[]; p.notes.unshift("Training status changed to "+status.replace(/-/g," ")+"."); put(memberId,p); return p;
  }
  function addGoal(memberId, text, targetOn, id) {
    var p=profile(memberId); p.goals=p.goals||[];
    p.goals.unshift({id:id||("g"+Date.now()),text:text,targetOn:targetOn||null,status:"active"}); put(memberId,p); return p;
  }
  function toggleGoal(memberId, goalId) {
    var p=profile(memberId); p.goals=p.goals||[];
    p.goals.forEach(function(g){if(String(g.id)===String(goalId))g.status=g.status==="achieved"?"active":"achieved";}); put(memberId,p); return p;
  }
  function addConstraint(memberId, category, summary, reviewOn, id) {
    var p=profile(memberId); p.constraints=p.constraints||[];
    p.constraints.unshift({id:id||("c"+Date.now()),category:category,summary:summary,startsOn:LT.today(),reviewOn:reviewOn||null,active:true});
    if(p.trainingStatus==="active")p.trainingStatus="load-managed"; put(memberId,p); return p;
  }
  function closeConstraint(memberId, constraintId) {
    var p=profile(memberId); p.constraints=(p.constraints||[]).filter(function(c){return String(c.id)!==String(constraintId);}); put(memberId,p); return p;
  }
  function addObservation(memberId, focus, effort, movementQuality, note, id) {
    var p=profile(memberId); p.observations=p.observations||[];
    p.observations.unshift({id:id||("o"+Date.now()),sessionOn:LT.today(),focus:focus,effort:Number(effort),movementQuality:Number(movementQuality),note:note||null});
    put(memberId,p); return p;
  }
  function addReview(memberId, outcome, nextReviewOn, note, id) {
    var p=profile(memberId); p.reviews=p.reviews||[];
    p.reviews.unshift({id:id||("r"+Date.now()),completedAt:LT.today(),outcome:outcome,nextReviewOn:nextReviewOn,notes:note||null});
    p.lastAssessed=LT.today(); p.reviewDue=nextReviewOn;
    if(outcome==="pause")p.trainingStatus="paused";
    if(outcome==="return-to-play")p.trainingStatus="return-to-play";
    put(memberId,p); return p;
  }
  function hydrateCloud(bundle) {
    if (!bundle || !bundle.progress || !bundle.progress.length) return false;
    var overrides=saved();
    bundle.progress.forEach(function(row){
      var id=String(row.member_id),p=profile(id);
      p.level=Number(row.current_level||1); p.levelSince=row.level_since||LT.today();
      p.trainingStatus=row.training_status||"active"; p.coach=row.primary_coach_name||p.coach||"Unassigned";
      p.lastAssessed=(row.last_assessed_at||"").slice(0,10)||p.lastAssessed||LT.today(); p.frameworkVersion=Number(row.framework_version||1);
      p.reviewDue=row.review_due_on||null;
      p.completed=[]; p.learning=[];
      (bundle.assessments||[]).filter(function(a){return String(a.member_id)===id&&Number(a.framework_version||1)===p.frameworkVersion;}).forEach(function(a){if(a.state==="mastered")p.completed.push(a.skill_id);if(a.state==="learning")p.learning.push(a.skill_id);});
      var hist=(bundle.history||[]).filter(function(h){return String(h.member_id)===id;}).sort(function(a,b){return String(a.started_on).localeCompare(String(b.started_on));});
      if(hist.length)p.history=hist.filter(function(h){return h.completed_on;}).map(function(h){return {level:Number(h.level),from:h.started_on,to:h.completed_on,promotedBy:h.approved_by_name||null};});
      var notes=(bundle.notes||[]).filter(function(n){return String(n.member_id)===id;}).sort(function(a,b){return String(b.noted_at).localeCompare(String(a.noted_at));});
      if(notes.length)p.notes=notes.map(function(n){return n.note;});
      var goals=(bundle.goals||[]).filter(function(g){return String(g.member_id)===id;});
      if(goals.length)p.goals=goals.map(function(g){return {id:g.id,text:g.goal,targetOn:g.target_on,status:g.status};});
      p.constraints=(bundle.constraints||[]).filter(function(c){return String(c.member_id)===id;}).map(function(c){return {id:c.id,category:c.category,summary:c.summary,startsOn:c.starts_on,reviewOn:c.review_on,endsOn:c.ends_on};});
      p.observations=(bundle.observations||[]).filter(function(o){return String(o.member_id)===id;}).map(function(o){return {id:o.id,sessionOn:o.session_on,focus:o.focus,effort:o.effort,movementQuality:o.movement_quality,note:o.note};});
      p.reviews=(bundle.reviews||[]).filter(function(r){return String(r.member_id)===id;}).map(function(r){return {id:r.id,completedAt:r.completed_at,outcome:r.outcome,nextReviewOn:r.next_review_on,notes:r.notes};});
      overrides[id]=p;
    });
    LT.store.write("player-progress",overrides); return true;
  }
  function promote(memberId, coach) {
    var p = profile(memberId); if (gateCompletion(p) < 100 || p.level >= 5 || ["paused","return-to-play","exited"].indexOf(p.trainingStatus)!==-1) return null;
    var old = p.level;
    p.history = p.history || [];
    p.history.push({level:old,from:p.levelSince,to:LT.today(),promotedBy:coach || p.coach});
    p.level = old + 1; p.levelSince = LT.today(); p.completed = []; p.learning = []; p.lastAssessed = LT.today();
    p.notes = p.notes || []; p.notes.unshift("Promoted to " + levels[p.level-1].name + " by " + (coach || p.coach) + ".");
    put(memberId,p); return p;
  }

  window.LTP = { levels:levels, skills:skills, seed:seed, profile:profile, roster:roster, levelSkills:levelSkills, completion:completion, gateCompletion:gateCompletion, velocity:velocity, signal:signal, setSkill:setSkill, addNote:addNote, setTrainingStatus:setTrainingStatus, addGoal:addGoal, toggleGoal:toggleGoal, addConstraint:addConstraint, closeConstraint:closeConstraint, addObservation:addObservation, addReview:addReview, hydrateCloud:hydrateCloud, promote:promote, days:days };
})();
