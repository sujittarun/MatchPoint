(function () {
  "use strict";
  LT.auth.require();
  LT.managerShell("progress.html");

  var search = document.getElementById("progressSearch");
  var levelFilter = document.getElementById("levelFilter");
  var signalFilter = document.getElementById("signalFilter");
  var rows = document.getElementById("progressRows");
  var currentMemberId = null;
  var requestedPlayer = new URLSearchParams(location.search).get("player");

  /* ---- feature flags ----
     Flip a value to true and the section returns fully wired — forms,
     local storage and cloud sync for every section stay intact while off.
     A per-device override can be set from the console:
       LT.store.write("progress-features", { sessionNote: true })            */
  var FEATURES = Object.assign({
    sessionNote: false,       // "Quick session note" after training
    playerGoals: false,       // monthly player goals
    careInstructions: false   // load / participation constraints
  }, LT.store.read("progress-features", {}));
  document.querySelectorAll("[data-feature]").forEach(function (el) {
    if (FEATURES[el.dataset.feature] === false) el.classList.add("hide");
  });
  (function paintGuide() {
    var guide = document.querySelector(".drawer-guide");
    if (!guide) return;
    guide.innerHTML = "<strong>How this works:</strong> after each session, tick the skills the player proved" +
      (FEATURES.sessionNote ? " and leave a quick note" : "") +
      ". Every 45 days, do the review. When every required skill is ✓, promote.";
  })();

  var signalLabel = { fast:"Fast learner", ready:"Ready for review", stalled:"Needs attention", managed:"Managed pathway", "on-track":"On track" };
  var signalPriority = { ready:1, stalled:2, managed:3, fast:4, "on-track":5 };
  var statusLabel = { active:"Active", "load-managed":"Load managed", paused:"Paused", "return-to-play":"Return to play", exited:"Exited pathway" };

  function esc(value) { return LT.esc(value == null ? "" : value); }
  function niceDate(iso) {
    if (!iso) return "not recorded";
    var date = new Date(iso); if (isNaN(date.getTime())) return "not recorded";
    return date.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
  }
  function futureDate(days) { var d=new Date(LT.today()+"T00:00:00");d.setDate(d.getDate()+days);return LT.isoDate(d); }
  function levelById(id) { return LTP.levels[Number(id)-1]; }
  function liveStaff() { return !!(window.LT_CLOUD && LT_CLOUD.hasStaffSession && LT_CLOUD.hasStaffSession()); }
  function writeFailed(label,err){LT.toast(label+" not saved: "+(err&&err.message?err.message:err));}
  // Demo-only players exist in the local seed but not in the cloud roster, so
  // cloud writes for them are rejected ("player progress not initialized").
  // Fall back to an on-device save for those; every other rejection (network,
  // promotion gates, invalid state) still fails loudly.
  function demoFallback(label,err,apply,onFail){
    var msg=String(err&&err.message?err.message:err);
    if(/not initialized|does not belong to tenant|not active in the player/i.test(msg)){apply();LT.toast("✓ Saved on this device — demo player");}
    else{if(onFail)onFail();writeFailed(label,err);}
  }
  function stateOf(profile, id) {
    if ((profile.completed||[]).indexOf(id)!==-1) return "mastered";
    if ((profile.learning||[]).indexOf(id)!==-1) return "learning";
    return "not-started";
  }
  function signalHtml(value) { return '<span class="signal '+value+'">'+(signalLabel[value]||value)+"</span>"; }
  function isAttention(value) { return value === "stalled" || value === "managed"; }

  LTP.levels.forEach(function (level) {
    levelFilter.insertAdjacentHTML("beforeend",'<option value="'+level.id+'">'+level.short+" · "+level.name+"</option>");
  });

  function all() { return LTP.roster(); }
  function filtered() {
    var q=search.value.trim().toLowerCase(), lv=levelFilter.value, sig=signalFilter.value;
    return all().filter(function (item) {
      var signalMatch=sig==="all" || item.signal===sig || (sig==="attention"&&isAttention(item.signal));
      return (!q || item.member.name.toLowerCase().indexOf(q)!==-1 || item.profile.coach.toLowerCase().indexOf(q)!==-1) &&
        (lv==="all" || item.profile.level===Number(lv)) && signalMatch;
    });
  }

  function paintKpis(list) {
    document.getElementById("kpiTracked").textContent=list.length;
    document.getElementById("kpiFast").textContent=list.filter(function(x){return x.signal==="fast";}).length;
    document.getElementById("kpiReady").textContent=list.filter(function(x){return x.signal==="ready";}).length;
    document.getElementById("kpiStalled").textContent=list.filter(function(x){return isAttention(x.signal);}).length;
  }

  function paintCoachMonitor(list) {
    var by={};
    list.forEach(function(item){
      var coach=item.profile.coach||"Unassigned", bucket=by[coach]||(by[coach]={assigned:0,attention:0,ready:0,recent:0});
      bucket.assigned++;
      if(isAttention(item.signal))bucket.attention++;
      if(item.signal==="ready")bucket.ready++;
      if(LTP.days(item.profile.lastAssessed)<=30)bucket.recent++;
    });
    var coaches=Object.keys(by).sort(function(a,b){return by[b].attention-by[a].attention||a.localeCompare(b);});
    document.getElementById("coachMonitor").innerHTML=coaches.map(function(coach){
      var b=by[coach],coverage=b.assigned?Math.round(b.recent/b.assigned*100):0;
      return '<article class="coach-row '+(b.attention?'needs-review':'')+'"><div class="coach-row-head"><strong>'+esc(coach)+'</strong><span>'+(b.attention?b.attention+' action'+(b.attention===1?'':'s')+' pending':'All caught up')+'</span></div><div class="coach-stats"><div class="coach-stat"><b>'+b.assigned+'</b><small>players assigned</small></div><div class="coach-stat"><b>'+coverage+'%</b><small>reviewed · 30 days</small></div><div class="coach-stat"><b>'+b.ready+'</b><small>ready to move up</small></div></div></article>';
    }).join("")||'<div class="empty-state">No assigned development players yet.</div>';
  }

  function paintDistribution(list) {
    var max=Math.max.apply(null,LTP.levels.map(function(l){return list.filter(function(x){return x.profile.level===l.id;}).length;}))||1;
    document.getElementById("levelDistribution").innerHTML=LTP.levels.map(function(level){
      var count=list.filter(function(x){return x.profile.level===level.id;}).length;
      return '<div class="level-row"><div class="level-label" style="color:'+level.colour+'"><i></i><div><strong>'+level.short+" · "+level.name+'</strong><span>'+level.summary+'</span></div></div><div class="level-track"><i style="--w:'+(count/max*100)+'%;--c:'+level.colour+'"></i></div><b>'+count+"</b></div>";
    }).join("");
    var histories=[]; list.forEach(function(x){(x.profile.history||[]).forEach(function(h){var d=LTP.days(h.from,h.to);if(d>=7)histories.push(d);});});
    var avg=histories.length?Math.round(histories.reduce(function(a,b){return a+b;},0)/histories.length):0;
    document.getElementById("avgMove").textContent=histories.length?avg+"d average move":"Awaiting first move";
  }

  function paintTalent(list) {
    var chosen=list.slice().sort(function(a,b){return signalPriority[a.signal]-signalPriority[b.signal] || b.velocity-a.velocity;}).slice(0,5);
    document.getElementById("talentList").innerHTML=chosen.map(function(item){
      var context=item.signal==="ready"?item.gatePct+"% required skills signed off":item.signal==="stalled"?item.days+" days at "+item.level.short:item.signal==="managed"?(statusLabel[item.profile.trainingStatus]||"Managed")+" · coach follow-up":item.velocity+"% learning speed";
      return '<div class="talent-item" role="button" tabindex="0" data-player="'+item.member.id+'"><span class="talent-av">'+LT.initials(item.member.name)+'</span><div class="talent-copy"><strong class="talent-name">'+esc(item.member.name)+'</strong><span class="talent-sub">'+item.level.name+" · "+context+'</span></div>'+signalHtml(item.signal)+"</div>";
    }).join("");
  }

  function render() {
    var everything=all(), list=filtered();
    paintKpis(everything); paintCoachMonitor(everything); paintDistribution(everything); paintTalent(everything);
    rows.innerHTML=list.map(function(item){
      var speedClass=item.velocity>=120?"up":item.velocity<80?"down":"";
      return '<tr tabindex="0" data-player="'+item.member.id+'"><td><div class="progress-player"><span class="talent-av">'+LT.initials(item.member.name)+'</span><div><strong>'+esc(item.member.name)+'</strong><small>'+esc(item.profile.coach)+'</small></div></div></td><td><span class="level-chip" style="--c:'+item.level.colour+'"><i></i>'+item.level.short+" · "+item.level.name+'</span></td><td><div class="skill-cell"><b>'+item.gatePct+'%</b><span class="skill-mini"><i style="--w:'+item.gatePct+'%"></i></span></div></td><td><span class="day-copy"><strong>'+item.days+' days</strong><small>target '+item.level.targetDays+'d</small></span></td><td><span class="velocity '+speedClass+'">'+item.velocity+'%</span></td><td>'+signalHtml(item.signal)+"</td></tr>";
    }).join("");
    document.getElementById("progressEmpty").classList.toggle("hide",!!list.length);
    document.querySelectorAll(".progress-kpis [data-signal]").forEach(function(btn){btn.classList.toggle("active",btn.dataset.signal===signalFilter.value);});
  }

  function paintGoals(p) {
    document.getElementById("playerGoals").innerHTML=(p.goals||[]).map(function(goal){
      var achieved=goal.status==="achieved";
      return '<div class="player-goal '+(achieved?'achieved':'')+'"><button class="goal-check" type="button" data-goal="'+esc(goal.id)+'" aria-label="'+(achieved?'Reopen':'Complete')+' goal">'+(achieved?'✓':'')+'</button><div><strong>'+esc(goal.text)+'</strong><small>'+(goal.targetOn?'Target '+niceDate(goal.targetOn):'No target date')+' · '+(achieved?'achieved':'active')+'</small></div></div>';
    }).join("")||'<div class="empty-state">No development goals yet.</div>';
  }

  function paintSupportRecords(p) {
    document.getElementById("playerConstraints").innerHTML=(p.constraints||[]).map(function(item){return '<div class="compact-item"><div><strong>'+esc(item.summary)+'</strong><small>'+esc(String(item.category||"").replace(/-/g," "))+(item.reviewOn?' · review '+niceDate(item.reviewOn):'')+'</small></div><button class="btn btn-glass" type="button" data-close-constraint="'+esc(item.id)+'">Close</button></div>';}).join("")||'<div class="empty-state">No active constraints.</div>';
    document.getElementById("playerObservations").innerHTML=(p.observations||[]).slice(0,4).map(function(item){return '<div class="compact-item"><div><strong>'+esc(item.focus||"Training session")+'</strong><small>'+niceDate(item.sessionOn)+(item.note?' · '+esc(item.note):'')+'</small></div><div class="score-pair"><span>Effort '+item.effort+'/5</span><span>Movement '+item.movementQuality+'/5</span></div></div>';}).join("")||'<div class="empty-state">No session observations yet.</div>';
    document.getElementById("playerReviews").innerHTML=(p.reviews||[]).slice(0,4).map(function(item){return '<div class="compact-item"><div><strong>'+esc(String(item.outcome||"review").replace(/-/g," "))+'</strong><small>'+niceDate(item.completedAt)+(item.notes?' · '+esc(item.notes):'')+' · next '+niceDate(item.nextReviewOn)+'</small></div></div>';}).join("")||'<div class="empty-state">No completed development reviews yet.</div>';
    var due=p.reviewDue,overdue=due&&String(due)<LT.today();
    document.getElementById("reviewDuePill").textContent=due?(overdue?'Overdue · ':'Due · ')+niceDate(due):"Set first review";
    document.getElementById("reviewDuePill").className="pill "+(overdue?"red":"gold");
  }

  function openPlayer(id) {
    var item=all().find(function(x){return String(x.member.id)===String(id);}); if(!item)return;
    currentMemberId=item.member.id;
    var p=item.profile,m=item.member,level=item.level;
    var required=LTP.levelSkills(p.level).filter(function(skill){return skill.core;});
    var requiredDone=required.filter(function(skill){return stateOf(p,skill.id)==="mastered";}).length;
    document.getElementById("playerAvatar").textContent=LT.initials(m.name);
    document.getElementById("playerLevel").textContent=level.short+" · "+level.name;
    document.getElementById("playerName").textContent=m.name;
    document.getElementById("playerMeta").textContent=(m.age?"Age "+m.age+" · ":"")+p.coach+" · last reviewed "+niceDate(p.lastAssessed);
    document.getElementById("profileSummary").innerHTML=
      '<div class="profile-stat"><span>Required sign-offs</span><strong>'+item.gatePct+'%</strong><small>'+requiredDone+" of "+required.length+'</small></div>'+
      '<div class="profile-stat"><span>At this level</span><strong>'+item.days+'d</strong><small>target '+level.targetDays+' days</small></div>'+
      '<div class="profile-stat"><span>Learning speed</span><strong>'+item.velocity+'%</strong><small>100% = academy pace</small></div>'+
      '<div class="profile-stat"><span>Coach signal</span><strong style="font-size:13px">'+signalLabel[item.signal]+'</strong><small>'+statusLabel[p.trainingStatus||"active"]+'</small></div>';
    document.getElementById("velocityPill").textContent=item.velocity+"% of academy pace";

    document.getElementById("trainingStatusSelect").value=p.trainingStatus||"active";
    var activeConstraint=(p.constraints||[])[0];
    document.getElementById("trainingStatusGuidance").textContent=activeConstraint?activeConstraint.summary+(activeConstraint.reviewOn?" · review "+niceDate(activeConstraint.reviewOn):""):(p.trainingStatus==="active"?"Available for normal training and promotion review.":"Coach follow-up required before normal progression.");

    var completedHistory=(p.history||[]).map(function(h){return {level:h.level,days:LTP.days(h.from,h.to),date:h.to};});
    var timeline=completedHistory.concat([{level:p.level,days:item.days,date:null,current:true}]);
    document.getElementById("levelTimeline").innerHTML=timeline.map(function(step){var l=levelById(step.level);return '<div class="timeline-step" style="--step:'+l.colour+'"><i></i><strong>'+l.short+" · "+l.name+'</strong><span>'+step.days+' days'+(step.current?" · current":"")+"</span></div>";}).join("");
    document.getElementById("checklistTitle").textContent=level.name+" competency checklist";

    var categories={}; LTP.levelSkills(p.level).forEach(function(s){(categories[s.category]=categories[s.category]||[]).push(s);});
    document.getElementById("skillGroups").innerHTML=Object.keys(categories).map(function(category){
      var group=categories[category],done=group.filter(function(s){return stateOf(p,s.id)==="mastered";}).length;
      return '<section class="skill-group"><header><span>'+category+'</span><span>'+done+" / "+group.length+'</span></header>'+group.map(function(s){var state=stateOf(p,s.id),icon=state==="mastered"?"✓":state==="learning"?"◐":"·";return '<div class="skill-item '+state+'" role="button" tabindex="0" data-skill="'+s.id+'"><span class="skill-state">'+icon+'</span><span class="skill-copy"><strong>'+esc(s.name)+(s.core?"":' <small>optional</small>')+'</strong><small>'+esc(s.cue)+'</small></span><span>'+state.replace("-"," ")+'</span></div>';}).join("")+"</section>";
    }).join("");
    paintGoals(p);
    paintSupportRecords(p);
    document.getElementById("coachNotes").innerHTML=(p.notes||[]).map(function(note,i){return '<div class="coach-note">'+esc(note)+(i===0?' <span class="faint">· latest</span>':"")+"</div>";}).join("")||'<div class="empty-state">No assessment notes yet.</div>';

    var promote=document.getElementById("promoteBtn"), statusAllows=["active","load-managed"].indexOf(p.trainingStatus||"active")!==-1, ready=item.gatePct===100&&p.level<5&&statusAllows;
    promote.disabled=!ready;
    promote.textContent=p.level>=5?"Highest pathway level":!statusAllows?"Training status blocks promotion":ready?"Promote to "+levelById(p.level+1).name:"Complete required skills first";
    document.getElementById("gateTitle").textContent=p.level>=5?"Performance pathway":"Promotion gate · "+item.gatePct+"%";
    document.getElementById("gateCopy").textContent=p.level>=5?"Continue individual performance planning and competition reviews.":!statusAllows?"Return the player to active or load-managed status before promotion.":ready?"Required competencies are signed off. Coach approval is still required.":(required.length-requiredDone)+" required competencies remain before coach review.";
    document.getElementById("progressBackdrop").classList.add("open");
  }

  function cycleSkill(skillId) {
    if(!currentMemberId)return;
    var memberId=currentMemberId,p=LTP.profile(memberId),state=stateOf(p,skillId),next=state==="not-started"?"learning":state==="learning"?"mastered":"not-started";
    function apply(){LTP.setSkill(memberId,skillId,next);render();openPlayer(memberId);LT.toast(next==="mastered"?"Skill signed off ✓":"Skill marked "+next.replace("-"," "));}
    if(liveStaff()&&LT_CLOUD.saveSkillAssessment)LT_CLOUD.saveSkillAssessment(memberId,skillId,next,p.coach).then(apply).catch(function(err){demoFallback("Assessment",err,apply);});else apply();
  }

  function closePlayer(){document.getElementById("progressBackdrop").classList.remove("open");currentMemberId=null;}
  [search,levelFilter,signalFilter].forEach(function(el){el.addEventListener(el===search?"input":"change",render);});
  document.querySelector(".progress-kpis").addEventListener("click",function(e){var b=e.target.closest("[data-signal]");if(!b)return;signalFilter.value=b.dataset.signal;render();document.querySelector(".roster-card").scrollIntoView({behavior:"smooth",block:"start"});});
  document.addEventListener("click",function(e){var target=e.target.closest("[data-player]");if(target)openPlayer(target.dataset.player);});
  document.addEventListener("keydown",function(e){var target=e.target.closest&&e.target.closest("[data-player], [data-skill]");if(target&&(e.key==="Enter"||e.key===" ")){e.preventDefault();target.click();}});
  document.getElementById("skillGroups").addEventListener("click",function(e){var row=e.target.closest("[data-skill]");if(row)cycleSkill(row.dataset.skill);});
  document.getElementById("progressClose").addEventListener("click",closePlayer);
  document.getElementById("progressBackdrop").addEventListener("click",function(e){if(e.target===this)closePlayer();});
  document.getElementById("trainingStatusSelect").addEventListener("change",function(){
    if(!currentMemberId)return;var memberId=currentMemberId,status=this.value;
    function apply(){LTP.setTrainingStatus(memberId,status);render();openPlayer(memberId);LT.toast("Training status: "+statusLabel[status]+" ✓");}
    if(liveStaff()&&LT_CLOUD.setTrainingStatus)LT_CLOUD.setTrainingStatus(memberId,status).then(apply).catch(function(err){demoFallback("Training status",err,apply,function(){openPlayer(memberId);});});else apply();
  });
  document.getElementById("noteForm").addEventListener("submit",function(e){
    e.preventDefault();var input=document.getElementById("noteText"),note=input.value.trim();if(!note||!currentMemberId)return;
    var memberId=currentMemberId,p=LTP.profile(memberId);
    function apply(){LTP.addNote(memberId,note);input.value="";render();openPlayer(memberId);LT.toast("Assessment note saved ✓");}
    if(liveStaff()&&LT_CLOUD.addProgressNote)LT_CLOUD.addProgressNote(memberId,note,p.coach).then(apply).catch(function(err){demoFallback("Assessment note",err,apply);});else apply();
  });
  document.getElementById("goalForm").addEventListener("submit",function(e){
    e.preventDefault();var input=document.getElementById("goalText"),date=document.getElementById("goalDate"),text=input.value.trim();if(!text||!currentMemberId)return;
    var memberId=currentMemberId,p=LTP.profile(memberId);
    function add(id){LTP.addGoal(memberId,text,date.value||null,id);input.value="";date.value="";render();openPlayer(memberId);LT.toast("Development goal added ✓");}
    if(liveStaff()&&LT_CLOUD.addPlayerGoal){LT_CLOUD.addPlayerGoal(memberId,text,date.value||null,p.coach).then(function(result){add(result&&result[0]&&result[0].id);}).catch(function(err){demoFallback("Development goal",err,function(){add();});});}else add();
  });
  document.getElementById("playerGoals").addEventListener("click",function(e){
    var button=e.target.closest("[data-goal]");if(!button||!currentMemberId)return;
    var memberId=currentMemberId,id=button.dataset.goal,current=(LTP.profile(memberId).goals||[]).find(function(g){return String(g.id)===String(id);}),desired=current&&current.status==="achieved"?"active":"achieved";
    function apply(){var p=LTP.toggleGoal(memberId,id),goal=(p.goals||[]).find(function(g){return String(g.id)===String(id);});render();openPlayer(memberId);LT.toast(goal&&goal.status==="achieved"?"Goal achieved ✓":"Goal reopened");}
    if(liveStaff()&&current&&/^\d+$/.test(String(id)))LT_CLOUD.updatePlayerGoal(id,desired).then(apply).catch(function(err){demoFallback("Goal update",err,apply);});else apply();
  });
  document.getElementById("constraintForm").addEventListener("submit",function(e){
    e.preventDefault();var memberId=currentMemberId,category=document.getElementById("constraintCategory").value,input=document.getElementById("constraintText"),review=document.getElementById("constraintReview"),summary=input.value.trim();if(!memberId||!summary)return;
    var coach=LTP.profile(memberId).coach;
    function add(result){var row=Array.isArray(result)?result[0]:result;LTP.addConstraint(memberId,category,summary,review.value||null,row&&row.id);input.value="";review.value="";render();openPlayer(memberId);LT.toast("Load guidance added ✓");}
    if(liveStaff()&&LT_CLOUD.addTrainingConstraint)LT_CLOUD.addTrainingConstraint(memberId,category,summary,review.value||null,coach).then(add).catch(function(err){demoFallback("Load guidance",err,function(){add();});});else add();
  });
  document.getElementById("playerConstraints").addEventListener("click",function(e){
    var button=e.target.closest("[data-close-constraint]");if(!button||!currentMemberId)return;var id=button.dataset.closeConstraint,memberId=currentMemberId;
    function apply(){LTP.closeConstraint(memberId,id);render();openPlayer(memberId);LT.toast("Constraint closed ✓");}
    if(liveStaff()&&/^\d+$/.test(String(id)))LT_CLOUD.closeTrainingConstraint(id).then(apply).catch(function(err){demoFallback("Constraint",err,apply);});else apply();
  });
  document.getElementById("observationForm").addEventListener("submit",function(e){
    e.preventDefault();var memberId=currentMemberId,focus=document.getElementById("observationFocus"),effort=document.getElementById("observationEffort").value,movement=document.getElementById("observationMovement").value,note=document.getElementById("observationNote"),text=focus.value.trim();if(!memberId||!text)return;var coach=LTP.profile(memberId).coach;
    function add(result){var row=Array.isArray(result)?result[0]:result;LTP.addObservation(memberId,text,effort,movement,note.value.trim(),row&&row.id);focus.value="";note.value="";render();openPlayer(memberId);LT.toast("Session observation recorded ✓");}
    if(liveStaff()&&LT_CLOUD.addTrainingObservation)LT_CLOUD.addTrainingObservation(memberId,text,effort,movement,note.value.trim(),coach).then(add).catch(function(err){demoFallback("Session observation",err,function(){add();});});else add();
  });
  document.getElementById("reviewForm").addEventListener("submit",function(e){
    e.preventDefault();var memberId=currentMemberId,outcome=document.getElementById("reviewOutcome").value,next=document.getElementById("nextReviewDate").value,note=document.getElementById("reviewNote"),text=note.value.trim();if(!memberId||!next)return;var coach=LTP.profile(memberId).coach;
    function add(result){var row=Array.isArray(result)?result[0]:result;LTP.addReview(memberId,outcome,next,text,row&&row.id);note.value="";document.getElementById("nextReviewDate").value=futureDate(45);render();openPlayer(memberId);LT.toast("Development review completed ✓");}
    if(liveStaff()&&LT_CLOUD.recordDevelopmentReview)LT_CLOUD.recordDevelopmentReview(memberId,outcome,next,text,coach).then(add).catch(function(err){demoFallback("Review",err,function(){add();});});else add();
  });
  document.getElementById("promoteBtn").addEventListener("click",function(){
    if(!currentMemberId)return;var memberId=currentMemberId,before=LTP.profile(memberId),nextLevel=before.level+1,button=this;
    function finish(){var next=LTP.promote(memberId,before.coach);if(!next)return;render();openPlayer(memberId);LT.toast("Player promoted to "+levelById(next.level).name+" ✓");}
    if(liveStaff()&&LT_CLOUD.promotePlayer){button.disabled=true;button.textContent="Promoting…";LT_CLOUD.promotePlayer(memberId,nextLevel,LT.today(),before.coach).then(finish).catch(function(err){demoFallback("Promotion",err,finish,function(){openPlayer(memberId);});});}else finish();
  });

  var framework=document.getElementById("frameworkBackdrop");
  document.getElementById("frameworkLevels").innerHTML=LTP.levels.map(function(l){var list=LTP.levelSkills(l.id);return '<article class="framework-level" style="--c:'+l.colour+'"><i></i><h3>'+l.short+" · "+l.name+'</h3><p>'+l.summary+'</p><ul>'+list.slice(0,6).map(function(s){return '<li>'+esc(s.name)+"</li>";}).join("")+'</ul><small>'+list.filter(function(s){return s.core;}).length+' required · '+list.length+' total · target '+l.targetDays+' days</small></article>';}).join("");
  document.getElementById("frameworkBtn").addEventListener("click",function(){framework.classList.add("open");});
  document.getElementById("frameworkClose").addEventListener("click",function(){framework.classList.remove("open");});
  framework.addEventListener("click",function(e){if(e.target===framework)framework.classList.remove("open");});

  function syncCloudRoster(cloudMembers) {
    if(!cloudMembers||!cloudMembers.length)return;
    var local=LT.store.read("members",[])||[],by={};local.forEach(function(m){by[String(m.id)]=m;});
    var phoneOf=function(p){return String(p||"").replace(/\D/g,"").slice(-10);};
    cloudMembers.forEach(function(row){
      var member={id:row.id,name:row.name,phone:row.phone||"",program:String(row.program||"").split(" · ")[0],venue:row.venue||String(row.program||"").split(" · ")[1]||"manikonda",joined:row.joined,validTill:row.valid_till,status:row.status||"active",isDemo:!!row.is_demo};
      // a member added on this device gets a provisional "M<ts>" id until the
      // cloud mints the real one — when the cloud row comes back, adopt it in
      // place of the provisional twin (matched by phone) instead of duplicating
      Object.keys(by).forEach(function(id){
        if(/^M\d+$/.test(id)&&phoneOf(by[id].phone)===phoneOf(member.phone)&&phoneOf(member.phone)){
          if(!member.program&&by[id].program)member.program=by[id].program;
          delete by[id];
        }
      });
      by[String(member.id)]=Object.assign({},by[String(member.id)]||{},member);
    });
    LT.store.write("members",Object.keys(by).map(function(id){return by[id];}));
  }

  render();
  document.getElementById("nextReviewDate").value=futureDate(45);
  if(requestedPlayer)openPlayer(requestedPlayer);
  if(liveStaff()&&LT_CLOUD.fetchMembers&&LT_CLOUD.fetchProgressBundle){
    LT_CLOUD.fetchMembers().then(function(members){syncCloudRoster(members);return LT_CLOUD.fetchProgressBundle();}).then(function(bundle){
      if(bundle&&LTP.hydrateCloud(bundle)){var reopen=currentMemberId||requestedPlayer;render();if(reopen)openPlayer(reopen);}
    });
  }
})();
