-- Match Point player-development subsystem — production schema.
-- Additive migration: all player-development data is staff-only and tenant-scoped.

-- Player development must remain venue-scopeable when Match Point adds its
-- second branch. Existing tenants keep null until their own migration sets it.
alter table public.members add column if not exists venue text;
alter table public.members add column if not exists is_demo boolean not null default false;

create table if not exists public.development_levels (
  tenant_id text not null references public.tenants(id) on delete cascade,
  framework_version integer not null default 1 check (framework_version > 0),
  level smallint not null check (level between 1 and 5),
  name text not null,
  summary text,
  target_days integer not null check (target_days > 0),
  colour text,
  active boolean not null default true,
  primary key (tenant_id,framework_version,level)
);

create table if not exists public.skill_catalog (
  tenant_id text not null references public.tenants(id) on delete cascade,
  framework_version integer not null default 1 check (framework_version > 0),
  skill_id text not null,
  level smallint not null check (level between 1 and 5),
  category text not null,
  name text not null,
  cue text,
  required boolean not null default true,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (tenant_id, framework_version, skill_id)
);

create table if not exists public.player_progress (
  tenant_id text not null references public.tenants(id) on delete cascade,
  member_id bigint not null references public.members(id) on delete cascade,
  framework_version integer not null default 1,
  baseline_level smallint not null default 1 check (baseline_level between 1 and 5),
  current_level smallint not null default 1 check (current_level between 1 and 5),
  level_since date not null default current_date,
  training_status text not null default 'active' check (training_status in ('active','load-managed','paused','return-to-play','exited')),
  primary_coach_id uuid references auth.users(id) on delete set null,
  primary_coach_name text,
  last_assessed_at timestamptz,
  review_due_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, member_id)
);

create table if not exists public.player_level_history (
  id bigint generated always as identity primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  member_id bigint not null references public.members(id) on delete cascade,
  framework_version integer not null default 1,
  level smallint not null check (level between 1 and 5),
  started_on date not null,
  completed_on date,
  transition_type text not null default 'promoted' check (transition_type in ('placement','promoted','demoted','returned','manual-correction')),
  transition_reason text,
  approved_by uuid references auth.users(id) on delete set null,
  approved_by_name text,
  created_at timestamptz not null default now(),
  check (completed_on is null or completed_on >= started_on)
);

create unique index if not exists player_level_one_open_idx
  on public.player_level_history (tenant_id, member_id) where completed_on is null;

create table if not exists public.skill_assessments (
  tenant_id text not null references public.tenants(id) on delete cascade,
  member_id bigint not null references public.members(id) on delete cascade,
  framework_version integer not null default 1,
  skill_id text not null,
  state text not null default 'not-started' check (state in ('not-started','learning','mastered')),
  confidence smallint check (confidence between 1 and 5),
  evidence text,
  assessed_by uuid references auth.users(id) on delete set null,
  assessed_by_name text,
  assessed_at timestamptz not null default now(),
  primary key (tenant_id, member_id, framework_version, skill_id),
  foreign key (tenant_id, framework_version, skill_id)
    references public.skill_catalog(tenant_id, framework_version, skill_id)
);

create table if not exists public.skill_assessment_events (
  id bigint generated always as identity primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  member_id bigint not null references public.members(id) on delete cascade,
  framework_version integer not null,
  skill_id text not null,
  previous_state text,
  new_state text not null check (new_state in ('not-started','learning','mastered')),
  confidence smallint check (confidence between 1 and 5),
  evidence text,
  assessed_by uuid references auth.users(id) on delete set null,
  assessed_by_name text,
  assessed_at timestamptz not null default now()
);

create table if not exists public.development_reviews (
  id bigint generated always as identity primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  member_id bigint not null references public.members(id) on delete cascade,
  scheduled_on date not null,
  completed_at timestamptz,
  outcome text check (outcome in ('continue','promote','adjust-plan','pause','return-to-play')),
  next_review_on date,
  coach_id uuid references auth.users(id) on delete set null,
  coach_name text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.player_goals (
  id bigint generated always as identity primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  member_id bigint not null references public.members(id) on delete cascade,
  framework_version integer not null default 1,
  skill_id text,
  goal text not null check (char_length(goal) between 1 and 500),
  target_on date,
  status text not null default 'active' check (status in ('active','achieved','paused','cancelled')),
  owner_id uuid references auth.users(id) on delete set null,
  owner_name text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.player_training_constraints (
  id bigint generated always as identity primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  member_id bigint not null references public.members(id) on delete cascade,
  category text not null check (category in ('load','movement','medical-clearance','schedule','other')),
  summary text not null check (char_length(summary) between 1 and 500),
  starts_on date not null default current_date,
  review_on date,
  ends_on date,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_by_name text,
  created_at timestamptz not null default now(),
  check (ends_on is null or ends_on >= starts_on)
);

create table if not exists public.training_observations (
  id bigint generated always as identity primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  member_id bigint not null references public.members(id) on delete cascade,
  session_on date not null default current_date,
  focus text,
  effort smallint check (effort between 1 and 5),
  movement_quality smallint check (movement_quality between 1 and 5),
  coach_id uuid references auth.users(id) on delete set null,
  coach_name text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.progress_notes (
  id bigint generated always as identity primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  member_id bigint not null references public.members(id) on delete cascade,
  note_type text not null default 'assessment' check (note_type in ('assessment','action','safety','general')),
  note text not null check (char_length(note) between 1 and 1200),
  coach_id uuid references auth.users(id) on delete set null,
  coach_name text,
  noted_at timestamptz not null default now()
);

create index if not exists player_progress_tenant_level_idx on public.player_progress (tenant_id,current_level,level_since);
create index if not exists player_progress_review_idx on public.player_progress (tenant_id,review_due_on) where training_status <> 'exited';
create index if not exists skill_assessments_member_idx on public.skill_assessments (tenant_id,member_id,assessed_at desc);
create index if not exists skill_events_member_idx on public.skill_assessment_events (tenant_id,member_id,assessed_at desc);
create index if not exists level_history_member_idx on public.player_level_history (tenant_id,member_id,started_on);
create index if not exists reviews_due_idx on public.development_reviews (tenant_id,scheduled_on) where completed_at is null;
create index if not exists goals_member_idx on public.player_goals (tenant_id,member_id,status,target_on);
create index if not exists constraints_member_idx on public.player_training_constraints (tenant_id,member_id,active,review_on);
create index if not exists observations_member_idx on public.training_observations (tenant_id,member_id,session_on desc);
create index if not exists progress_notes_member_idx on public.progress_notes (tenant_id,member_id,noted_at desc);

create or replace function public.progress_member_matches_tenant()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if not exists(select 1 from public.members m where m.id=new.member_id and m.tenant_id=new.tenant_id) then
    raise exception 'member % does not belong to tenant %',new.member_id,new.tenant_id;
  end if;
  return new;
end $$;

create or replace function public.initialize_member_progress()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_enabled boolean;
begin
  select coalesce((config#>>'{features,playerTracking}')::boolean,false) into v_enabled from public.tenants where id=new.tenant_id;
  if not v_enabled then return new; end if;
  insert into public.player_progress(tenant_id,member_id,framework_version,baseline_level,current_level,level_since,review_due_on)
    values(new.tenant_id,new.id,1,1,1,coalesce(new.joined,current_date),current_date+14)
    on conflict(tenant_id,member_id) do nothing;
  insert into public.player_level_history(tenant_id,member_id,framework_version,level,started_on,transition_type,transition_reason)
    select new.tenant_id,new.id,1,1,coalesce(new.joined,current_date),'placement','Initial pathway assessment pending'
    where not exists(select 1 from public.player_level_history where tenant_id=new.tenant_id and member_id=new.id);
  return new;
end $$;

drop trigger if exists initialize_member_progress on public.members;
create trigger initialize_member_progress after insert on public.members
for each row execute function public.initialize_member_progress();

do $$ declare t text; begin
  foreach t in array array['player_progress','player_level_history','skill_assessments','skill_assessment_events','development_reviews','player_goals','player_training_constraints','training_observations','progress_notes'] loop
    execute format('drop trigger if exists %I on public.%I','progress_member_tenant_guard_'||t,t);
    execute format('create trigger %I before insert or update on public.%I for each row execute function public.progress_member_matches_tenant()','progress_member_tenant_guard_'||t,t);
  end loop;
end $$;

create or replace function public.audit_skill_assessment()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_op='INSERT' or old.state is distinct from new.state or old.confidence is distinct from new.confidence or old.evidence is distinct from new.evidence then
    insert into public.skill_assessment_events
      (tenant_id,member_id,framework_version,skill_id,previous_state,new_state,confidence,evidence,assessed_by,assessed_by_name,assessed_at)
    values
      (new.tenant_id,new.member_id,new.framework_version,new.skill_id,case when tg_op='UPDATE' then old.state else null end,new.state,new.confidence,new.evidence,new.assessed_by,new.assessed_by_name,new.assessed_at);
  end if;
  return new;
end $$;

drop trigger if exists skill_assessment_audit on public.skill_assessments;
create trigger skill_assessment_audit after insert or update on public.skill_assessments
for each row execute function public.audit_skill_assessment();

create or replace function public.record_skill_assessment(
  p_tenant text,p_member_id bigint,p_skill_id text,p_state text,p_confidence smallint default null,p_evidence text default null,p_coach_name text default null
) returns public.skill_assessments language plpgsql security definer set search_path=public as $$
declare v_progress public.player_progress; v_row public.skill_assessments;
begin
  perform public.assert_staff(p_tenant);
  if p_state not in ('not-started','learning','mastered') then raise exception 'invalid skill state'; end if;
  select * into v_progress from public.player_progress where tenant_id=p_tenant and member_id=p_member_id for update;
  if not found then raise exception 'player progress not initialized'; end if;
  if not exists(select 1 from public.skill_catalog where tenant_id=p_tenant and framework_version=v_progress.framework_version and skill_id=p_skill_id and level=v_progress.current_level and active) then
    raise exception 'skill is not active in the player current level';
  end if;
  insert into public.skill_assessments(tenant_id,member_id,framework_version,skill_id,state,confidence,evidence,assessed_by,assessed_by_name,assessed_at)
  values(p_tenant,p_member_id,v_progress.framework_version,p_skill_id,p_state,p_confidence,p_evidence,auth.uid(),p_coach_name,now())
  on conflict(tenant_id,member_id,framework_version,skill_id) do update set
    state=excluded.state,confidence=excluded.confidence,evidence=excluded.evidence,assessed_by=excluded.assessed_by,assessed_by_name=excluded.assessed_by_name,assessed_at=excluded.assessed_at
  returning * into v_row;
  update public.player_progress set last_assessed_at=now(),review_due_on=current_date+45,updated_at=now()
    where tenant_id=p_tenant and member_id=p_member_id;
  return v_row;
end $$;

create or replace function public.record_development_review(
  p_tenant text,p_member_id bigint,p_outcome text,p_next_review_on date,p_notes text default null,p_coach_name text default null
) returns public.development_reviews language plpgsql security definer set search_path=public as $$
declare v_row public.development_reviews;
begin
  perform public.assert_staff(p_tenant);
  if p_outcome not in ('continue','promote','adjust-plan','pause','return-to-play') then raise exception 'invalid review outcome'; end if;
  if p_next_review_on is null or p_next_review_on<current_date then raise exception 'next review date must be today or later'; end if;
  if not exists(select 1 from public.player_progress where tenant_id=p_tenant and member_id=p_member_id for update) then raise exception 'player progress not initialized'; end if;
  insert into public.development_reviews(tenant_id,member_id,scheduled_on,completed_at,outcome,next_review_on,coach_id,coach_name,notes)
    values(p_tenant,p_member_id,current_date,now(),p_outcome,p_next_review_on,auth.uid(),p_coach_name,p_notes)
    returning * into v_row;
  update public.player_progress set
    last_assessed_at=now(),review_due_on=p_next_review_on,
    training_status=case when p_outcome='pause' then 'paused' when p_outcome='return-to-play' then 'return-to-play' else training_status end,
    updated_at=now()
  where tenant_id=p_tenant and member_id=p_member_id;
  return v_row;
end $$;

create or replace function public.promote_player(
  p_tenant text,p_member_id bigint,p_to_level smallint,p_reason text default null,p_coach_name text default null
) returns public.player_progress language plpgsql security definer set search_path=public as $$
declare v_progress public.player_progress; v_required integer; v_mastered integer; v_row public.player_progress;
begin
  perform public.assert_staff(p_tenant);
  select * into v_progress from public.player_progress where tenant_id=p_tenant and member_id=p_member_id for update;
  if not found then raise exception 'player progress not initialized'; end if;
  if p_to_level<>v_progress.current_level+1 or p_to_level>5 then raise exception 'promotion must move exactly one level'; end if;
  if v_progress.training_status not in ('active','load-managed') then raise exception 'player training status blocks promotion'; end if;
  select count(*) into v_required from public.skill_catalog where tenant_id=p_tenant and framework_version=v_progress.framework_version and level=v_progress.current_level and required and active;
  select count(*) into v_mastered from public.skill_assessments a join public.skill_catalog c using(tenant_id,framework_version,skill_id)
    where a.tenant_id=p_tenant and a.member_id=p_member_id and c.level=v_progress.current_level and c.required and c.active and a.state='mastered';
  if v_required=0 or v_mastered<v_required then raise exception 'required competency gate incomplete (% of %)',v_mastered,v_required; end if;
  update public.player_level_history set completed_on=current_date where tenant_id=p_tenant and member_id=p_member_id and completed_on is null;
  insert into public.player_level_history(tenant_id,member_id,framework_version,level,started_on,transition_type,transition_reason,approved_by,approved_by_name)
    values(p_tenant,p_member_id,v_progress.framework_version,p_to_level,current_date,'promoted',p_reason,auth.uid(),p_coach_name);
  update public.player_progress set current_level=p_to_level,level_since=current_date,last_assessed_at=now(),review_due_on=current_date+45,updated_at=now()
    where tenant_id=p_tenant and member_id=p_member_id returning * into v_row;
  return v_row;
end $$;

create or replace view public.player_development_summary with (security_invoker=true) as
select p.tenant_id,p.member_id,p.framework_version,m.name,m.program,p.current_level,p.level_since,p.training_status,p.primary_coach_name,
  m.venue,p.last_assessed_at,p.review_due_on,(current_date-p.level_since) as days_at_level,dl.target_days,
  count(distinct c.skill_id) filter(where c.required and c.active) as required_skills,
  count(distinct c.skill_id) filter(where c.required and c.active and a.state='mastered') as required_mastered,
  count(distinct c.skill_id) filter(where c.active) as total_skills,
  count(distinct c.skill_id) filter(where c.active and a.state='mastered') as total_mastered,
  count(distinct at.date) filter(where at.present and at.kind='member' and at.date>=current_date-29) as attendance_30d,
  (select round(avg(h.completed_on-h.started_on))::integer from public.player_level_history h where h.tenant_id=p.tenant_id and h.member_id=p.member_id and h.completed_on is not null) as avg_move_days,
  (select round(avg(hl.target_days)::numeric/nullif(avg(h.completed_on-h.started_on),0)*100)::integer
    from public.player_level_history h join public.development_levels hl on hl.tenant_id=h.tenant_id and hl.framework_version=h.framework_version and hl.level=h.level
    where h.tenant_id=p.tenant_id and h.member_id=p.member_id and h.completed_on is not null) as pace_index
from public.player_progress p join public.members m on m.id=p.member_id and m.tenant_id=p.tenant_id
join public.development_levels dl on dl.tenant_id=p.tenant_id and dl.framework_version=p.framework_version and dl.level=p.current_level
left join public.skill_catalog c on c.tenant_id=p.tenant_id and c.framework_version=p.framework_version and c.level=p.current_level
left join public.skill_assessments a on a.tenant_id=p.tenant_id and a.member_id=p.member_id and a.framework_version=c.framework_version and a.skill_id=c.skill_id
left join public.attendance at on at.tenant_id=p.tenant_id and at.person_id=p.member_id::text
group by p.tenant_id,p.member_id,p.framework_version,m.name,m.program,m.venue,p.current_level,p.level_since,p.training_status,p.primary_coach_name,p.last_assessed_at,p.review_due_on,dl.target_days;

create or replace view public.player_development_signals with (security_invoker=true) as
select s.*,case
  when s.training_status<>'active' then 'managed'
  when s.current_level<5 and s.required_skills>0 and s.required_mastered=s.required_skills then 'ready'
  when s.review_due_on<current_date or (s.days_at_level>s.target_days*1.2 and s.required_mastered*100/nullif(s.required_skills,0)<80) then 'stalled'
  when coalesce(s.pace_index,0)>=135 then 'fast'
  else 'on-track' end as development_signal
from public.player_development_summary s;

create or replace view public.coach_development_summary with (security_invoker=true) as
select p.tenant_id,coalesce(p.primary_coach_name,'Unassigned') as coach,
  count(*) filter(where p.training_status<>'exited') as assigned_players,
  count(*) filter(where p.review_due_on<current_date and p.training_status<>'exited') as overdue_reviews,
  count(*) filter(where s.required_skills>0 and s.required_mastered=s.required_skills and p.current_level<5) as promotion_reviews,
  count(*) filter(where p.last_assessed_at>=now()-interval '30 days') as assessed_last_30d,
  count(*) filter(where s.development_signal='fast') as fast_learners,
  count(*) filter(where s.development_signal in ('stalled','managed')) as attention_players
from public.player_progress p join public.player_development_signals s using(tenant_id,member_id)
group by p.tenant_id,coalesce(p.primary_coach_name,'Unassigned');

-- Current framework. Optional competencies enrich the pathway but do not block promotion.
insert into public.development_levels(tenant_id,framework_version,level,name,summary,target_days,colour) values
('matchpoint',1,1,'Foundation','Safe movement, clean contact and rally confidence',90,'#c9ff35'),
('matchpoint',1,2,'Developing','Reliable recovery and controlled stroke choices',110,'#64d9cb'),
('matchpoint',1,3,'Intermediate','Build patterns, defend pressure and create space',135,'#8f8bff'),
('matchpoint',1,4,'Advanced','Explosive attack, deception and tactical adaptation',165,'#ff9c33'),
('matchpoint',1,5,'Performance','Individual tournament system and repeatable performance',210,'#ff6f91')
on conflict(tenant_id,framework_version,level) do update set name=excluded.name,summary=excluded.summary,target_days=excluded.target_days,colour=excluded.colour,active=true;

insert into public.skill_catalog(tenant_id,framework_version,skill_id,level,category,name,cue,required,display_order) values
('matchpoint',1,'f-grip',1,'Technique','Forehand & backhand grip','Changes grip without looking',true,10),
('matchpoint',1,'f-ready',1,'Movement','Ready stance & split step','Balanced as opponent strikes',true,20),
('matchpoint',1,'f-lunge',1,'Movement','Lunge and recover','Knee aligned; returns to base',true,30),
('matchpoint',1,'f-lift',1,'Strokes','Underarm lift','High contact to rear tramlines',true,40),
('matchpoint',1,'f-clear',1,'Strokes','Overhead clear','Side-on action; reaches rear court',true,50),
('matchpoint',1,'f-serve',1,'Serve / receive','Short serve','Legal, repeatable low trajectory',true,60),
('matchpoint',1,'f-rally',1,'Match craft','Cooperative 10-shot rally','Controls direction and tempo',true,70),
('matchpoint',1,'f-rules',1,'Match craft','Scoring & court rules','Scores and positions independently',false,80),
('matchpoint',1,'d-split',2,'Movement','Timed split step','Lands as opponent contacts',true,110),
('matchpoint',1,'d-six',2,'Movement','Six-corner shadow','Efficient chasse, crossover and recovery',true,120),
('matchpoint',1,'d-clear',2,'Strokes','Directional clear','Straight and cross-court depth',true,130),
('matchpoint',1,'d-drop',2,'Strokes','Basic drop shot','Same preparation as clear',true,140),
('matchpoint',1,'d-net',2,'Strokes','Net shot & recovery','Tight trajectory; racket remains high',true,150),
('matchpoint',1,'d-serve',2,'Serve / receive','Long serve & return','Selects response by flight',true,160),
('matchpoint',1,'d-drive',2,'Serve / receive','Drive exchange','Compact action in front of body',true,170),
('matchpoint',1,'d-pattern',2,'Match craft','Clear–drop movement pattern','Recovers and repeats under control',true,180),
('matchpoint',1,'i-smash',3,'Attack','Smash technique','Contact in front; steep controlled finish',true,210),
('matchpoint',1,'i-block',3,'Defence','Smash block defence','Absorbs pace straight and cross',true,220),
('matchpoint',1,'i-backhand',3,'Strokes','Backhand clear','Sound grip change and rotation',true,230),
('matchpoint',1,'i-netkill',3,'Attack','Net kill & interception','Takes shuttle early without touching net',true,240),
('matchpoint',1,'i-push',3,'Strokes','Mid-court push','Creates space past front player',true,250),
('matchpoint',1,'i-single',3,'Tactics','Singles base & construction','Moves opponent before attacking',true,260),
('matchpoint',1,'i-double',3,'Tactics','Doubles rotation','Transitions attack–defence with partner',true,270),
('matchpoint',1,'i-condition',3,'Physical','Repeat-footwork capacity','Maintains quality across six sets',true,280),
('matchpoint',1,'a-jump',4,'Attack','Jump smash','Stable take-off, contact and landing',true,310),
('matchpoint',1,'a-slice',4,'Attack','Slice & reverse-slice drop','Same preparation; controlled deception',true,320),
('matchpoint',1,'a-spin',4,'Front court','Tumbling net shot','Takes early and forces lift',true,330),
('matchpoint',1,'a-counter',4,'Defence','Counter-attack defence','Converts block or drive into initiative',true,340),
('matchpoint',1,'a-return',4,'Serve / receive','Pressure return patterns','Four reliable doubles returns',true,350),
('matchpoint',1,'a-rotate',4,'Tactics','Rear/front court rotation','Reads partner and closes space',true,360),
('matchpoint',1,'a-scan',4,'Tactics','Opponent pattern recognition','Names and exploits two tendencies',true,370),
('matchpoint',1,'a-pressure',4,'Match craft','Pressure routine','Resets consistently between rallies',true,380),
('matchpoint',1,'p-plan',5,'Competition','Individual game model','Defined strengths, patterns and constraints',true,410),
('matchpoint',1,'p-video',5,'Competition','Video self-analysis','Tags errors, winners and rally phases',true,420),
('matchpoint',1,'p-scout',5,'Tactics','Opponent scouting','Builds a practical pre-match plan',true,430),
('matchpoint',1,'p-multi',5,'Physical','Multi-shuttle speed endurance','Sustains movement and stroke quality',true,440),
('matchpoint',1,'p-load',5,'Physical','Training-load awareness','Reports readiness and recovery honestly',true,450),
('matchpoint',1,'p-sim',5,'Competition','Tournament simulation','Executes routines under score pressure',true,460),
('matchpoint',1,'p-mental',5,'Match craft','Focus & emotional reset','Returns to process after errors',true,470),
('matchpoint',1,'p-recovery',5,'Physical','Recovery habits','Sleep, hydration and nutrition plan',false,480)
on conflict(tenant_id,framework_version,skill_id) do update set
  level=excluded.level,category=excluded.category,name=excluded.name,cue=excluded.cue,required=excluded.required,display_order=excluded.display_order,active=true;

update public.members set venue='manikonda' where tenant_id='matchpoint' and venue is null;
insert into public.player_progress(tenant_id,member_id,framework_version,baseline_level,current_level,level_since,review_due_on)
select m.tenant_id,m.id,1,1,1,coalesce(m.joined,current_date),current_date+14
from public.members m join public.tenants t on t.id=m.tenant_id
where coalesce((t.config#>>'{features,playerTracking}')::boolean,false)
on conflict(tenant_id,member_id) do nothing;
insert into public.player_level_history(tenant_id,member_id,framework_version,level,started_on,transition_type,transition_reason)
select p.tenant_id,p.member_id,p.framework_version,p.current_level,p.level_since,'placement','Initial pathway assessment pending'
from public.player_progress p
where not exists(select 1 from public.player_level_history h where h.tenant_id=p.tenant_id and h.member_id=p.member_id);

do $$ declare t text; begin
  foreach t in array array['development_levels','skill_catalog','player_progress','player_level_history','skill_assessments','skill_assessment_events','development_reviews','player_goals','player_training_constraints','training_observations','progress_notes'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('drop policy if exists %I on public.%I',t||'_staff_r',t);
    execute format('drop policy if exists %I on public.%I',t||'_staff_w',t);
    execute format('drop policy if exists %I on public.%I',t||'_staff_u',t);
    execute format('drop policy if exists %I on public.%I',t||'_staff_d',t);
    execute format('create policy %I on public.%I for select to authenticated using (auth_role()=''operator'' or (auth_role()=''staff'' and tenant_id=auth_tenant()))',t||'_staff_r',t);
    execute format('create policy %I on public.%I for insert to authenticated with check (auth_role()=''staff'' and tenant_id=auth_tenant())',t||'_staff_w',t);
    execute format('create policy %I on public.%I for update to authenticated using (auth_role()=''staff'' and tenant_id=auth_tenant()) with check (auth_role()=''staff'' and tenant_id=auth_tenant())',t||'_staff_u',t);
    execute format('create policy %I on public.%I for delete to authenticated using (auth_role()=''staff'' and tenant_id=auth_tenant())',t||'_staff_d',t);
    execute format('grant select,insert,update,delete on public.%I to authenticated',t);
  end loop;
end $$;

-- Immutable audit log: staff can read events, only the audit trigger writes them.
drop policy if exists skill_assessment_events_staff_w on public.skill_assessment_events;
drop policy if exists skill_assessment_events_staff_u on public.skill_assessment_events;
drop policy if exists skill_assessment_events_staff_d on public.skill_assessment_events;
revoke insert,update,delete on public.skill_assessment_events from authenticated;

-- Framework versions are centrally managed so historical assessments cannot
-- silently change meaning underneath academy staff.
drop policy if exists skill_catalog_staff_w on public.skill_catalog;
drop policy if exists skill_catalog_staff_u on public.skill_catalog;
drop policy if exists skill_catalog_staff_d on public.skill_catalog;
drop policy if exists skill_catalog_operator_w on public.skill_catalog;
create policy skill_catalog_operator_w on public.skill_catalog for all to authenticated
  using(auth_role()='operator') with check(auth_role()='operator');
revoke insert,update,delete on public.skill_catalog from authenticated;
grant insert,update,delete on public.skill_catalog to authenticated;

drop policy if exists development_levels_staff_w on public.development_levels;
drop policy if exists development_levels_staff_u on public.development_levels;
drop policy if exists development_levels_staff_d on public.development_levels;
drop policy if exists development_levels_operator_w on public.development_levels;
create policy development_levels_operator_w on public.development_levels for all to authenticated
  using(auth_role()='operator') with check(auth_role()='operator');
revoke insert,update,delete on public.development_levels from authenticated;
grant insert,update,delete on public.development_levels to authenticated;

grant usage,select on all sequences in schema public to authenticated;
grant select on public.player_development_summary,public.player_development_signals,public.coach_development_summary to authenticated;
grant execute on function public.record_skill_assessment(text,bigint,text,text,smallint,text,text) to authenticated;
grant execute on function public.promote_player(text,bigint,smallint,text,text) to authenticated;
grant execute on function public.record_development_review(text,bigint,text,date,text,text) to authenticated;
