-- Match Point pitch dataset: nine fictional players covering the operational
-- scenarios an academy manager needs to evaluate. Safe to rerun: only rows
-- marked is_demo=true for this tenant are reset.

insert into public.members(tenant_id,name,phone,program,venue,joined,valid_till,status,is_demo)
select 'matchpoint',v.name,v.phone,v.program,'manikonda',current_date+v.joined_offset,current_date+180,'active',true
from (values
  ('Ananya Rao','9000000101','performance',-300),
  ('Rohit Varma','9000000102','junior',-280),
  ('Isha Reddy','9000000103','junior',-85),
  ('Kabir Shah','9000000104','performance',-420),
  ('Meera Nair','9000000105','junior',-205),
  ('Dev Menon','9000000106','performance',-250),
  ('Tara Kapoor','9000000107','junior',-14),
  ('Ayaan Khan','9000000108','performance',-75),
  ('Nisha Jain','9000000109','adult',-120)
) as v(name,phone,program,joined_offset)
where not exists(select 1 from public.members m where m.tenant_id='matchpoint' and m.phone=v.phone);

update public.members m set is_demo=true,venue='manikonda'
where m.tenant_id='matchpoint' and m.phone between '9000000101' and '9000000109';

-- Reset only the explicit pitch fixtures so reruns stay deterministic.
delete from public.skill_assessment_events e using public.members m where e.tenant_id='matchpoint' and e.member_id=m.id and m.is_demo;
delete from public.skill_assessments a using public.members m where a.tenant_id='matchpoint' and a.member_id=m.id and m.is_demo;
delete from public.development_reviews r using public.members m where r.tenant_id='matchpoint' and r.member_id=m.id and m.is_demo;
delete from public.player_goals g using public.members m where g.tenant_id='matchpoint' and g.member_id=m.id and m.is_demo;
delete from public.player_training_constraints c using public.members m where c.tenant_id='matchpoint' and c.member_id=m.id and m.is_demo;
delete from public.training_observations o using public.members m where o.tenant_id='matchpoint' and o.member_id=m.id and m.is_demo;
delete from public.progress_notes n using public.members m where n.tenant_id='matchpoint' and n.member_id=m.id and m.is_demo;
delete from public.player_level_history h using public.members m where h.tenant_id='matchpoint' and h.member_id=m.id and m.is_demo;

with setup(phone,baseline,current_level,since_offset,status,coach,assessed_offset,review_offset) as (values
  ('9000000101',1,4,-100,'active','Karthik Reddy',-4,30),
  ('9000000102',1,2,-180,'active','Sowmya Rao',-70,-25),
  ('9000000103',1,1,-85,'active','Sowmya Rao',-3,20),
  ('9000000104',1,5,-75,'active','Venu Muppala',-2,35),
  ('9000000105',1,2,-135,'load-managed','Venu Muppala',-12,10),
  ('9000000106',1,3,-60,'return-to-play','Karthik Reddy',-8,7),
  ('9000000107',1,1,-14,'active','Sowmya Rao',-7,7),
  ('9000000108',3,4,-30,'active','Venu Muppala',-2,28),
  ('9000000109',1,1,-120,'paused','Sowmya Rao',-35,-5)
)
update public.player_progress p set framework_version=1,baseline_level=s.baseline,current_level=s.current_level,
  level_since=current_date+s.since_offset,training_status=s.status,primary_coach_name=s.coach,
  last_assessed_at=now()+(s.assessed_offset||' days')::interval,review_due_on=current_date+s.review_offset,updated_at=now()
from public.members m join setup s on s.phone=m.phone
where p.tenant_id='matchpoint' and p.member_id=m.id and m.is_demo;

with segments(phone,level,start_offset,end_offset,transition_type,reason) as (values
  ('9000000101',1,-300,-250,'placement','Foundation placement'),('9000000101',2,-250,-190,'promoted','Rapid skill transfer'),('9000000101',3,-190,-100,'promoted','Competition evidence'),('9000000101',4,-100,null,'promoted','Current advanced plan'),
  ('9000000102',1,-280,-180,'placement','Foundation placement'),('9000000102',2,-180,null,'promoted','Current developing plan'),
  ('9000000103',1,-85,null,'placement','Foundation placement'),
  ('9000000104',1,-420,-375,'placement','Foundation placement'),('9000000104',2,-375,-315,'promoted','Gate passed'),('9000000104',3,-315,-235,'promoted','Gate passed'),('9000000104',4,-235,-75,'promoted','Competition plan'),('9000000104',5,-75,null,'promoted','Performance pathway'),
  ('9000000105',1,-205,-135,'placement','Foundation placement'),('9000000105',2,-135,null,'promoted','Load-managed development'),
  ('9000000106',1,-250,-205,'placement','Foundation placement'),('9000000106',2,-205,-120,'promoted','Gate passed'),('9000000106',3,-60,null,'returned','Return-to-play placement'),
  ('9000000107',1,-14,null,'placement','New starter baseline'),
  ('9000000108',3,-75,-30,'placement','Transfer assessment'),('9000000108',4,-30,null,'promoted','Advanced placement validated'),
  ('9000000109',1,-120,null,'placement','Adult pathway placement')
)
insert into public.player_level_history(tenant_id,member_id,framework_version,level,started_on,completed_on,transition_type,transition_reason,approved_by_name)
select 'matchpoint',m.id,1,s.level,current_date+s.start_offset,case when s.end_offset is null then null else current_date+s.end_offset end,s.transition_type,s.reason,'Pitch dataset'
from public.members m join segments s on s.phone=m.phone where m.tenant_id='matchpoint' and m.is_demo;

with competency(phone,current_level,mastered_count) as (values
  ('9000000101',4,6),('9000000102',2,3),('9000000103',1,7),('9000000104',5,5),('9000000105',2,7),
  ('9000000106',3,4),('9000000107',1,2),('9000000108',4,5),('9000000109',1,3)
), ranked as (
  select c.*,s.skill_id,row_number() over(partition by c.phone order by s.display_order) as rn
  from competency c join public.skill_catalog s on s.tenant_id='matchpoint' and s.framework_version=1 and s.level=c.current_level and s.active
)
insert into public.skill_assessments(tenant_id,member_id,framework_version,skill_id,state,confidence,evidence,assessed_by_name,assessed_at)
select 'matchpoint',m.id,1,r.skill_id,case when r.rn<=r.mastered_count then 'mastered' when r.rn=r.mastered_count+1 then 'learning' else 'not-started' end,
  case when r.rn<=r.mastered_count then 4 else null end,'Pitch scenario evidence','Pitch dataset',now()-interval '2 days'
from ranked r join public.members m on m.tenant_id='matchpoint' and m.phone=r.phone;

insert into public.player_goals(tenant_id,member_id,goal,target_on,status,owner_name)
select 'matchpoint',m.id,v.goal,current_date+v.target_offset,v.status,v.coach
from (values
  ('9000000101','Use patient first attack in 7 of 10 conditioned games',21,'active','Karthik Reddy'),
  ('9000000102','Recover to base with balanced split step in 8 of 10 feeds',14,'active','Sowmya Rao'),
  ('9000000103','Score and position independently across one full game',10,'active','Sowmya Rao'),
  ('9000000104','Execute tournament reset routine after every unforced error',28,'active','Venu Muppala'),
  ('9000000105','Complete six-corner movement at controlled volume',18,'active','Venu Muppala'),
  ('9000000106','Complete 3 x 6 minute movement blocks pain-free',12,'active','Karthik Reddy')
) v(phone,goal,target_offset,status,coach) join public.members m on m.tenant_id='matchpoint' and m.phone=v.phone;

insert into public.player_training_constraints(tenant_id,member_id,category,summary,starts_on,review_on,active,created_by_name)
select 'matchpoint',m.id,v.category,v.summary,current_date-7,current_date+v.review_offset,true,v.coach
from (values
  ('9000000105','load','Limit repeated overhead volume; use controlled multi-feed blocks',10,'Venu Muppala'),
  ('9000000106','medical-clearance','No maximal jump-smash work until return-to-play review',7,'Karthik Reddy'),
  ('9000000109','schedule','Pathway paused during school examinations',14,'Sowmya Rao')
) v(phone,category,summary,review_offset,coach) join public.members m on m.tenant_id='matchpoint' and m.phone=v.phone;

insert into public.training_observations(tenant_id,member_id,session_on,focus,effort,movement_quality,coach_name,note)
select 'matchpoint',m.id,current_date+v.day_offset,v.focus,v.effort,v.movement,v.coach,v.note
from (values
  ('9000000101',-4,'Pressure return patterns',4,5,'Karthik Reddy','Transferred pattern into conditioned games'),
  ('9000000102',-9,'Six-corner recovery',4,2,'Sowmya Rao','Late base recovery after backhand rear corner'),
  ('9000000103',-3,'Serve, score and rally',3,4,'Sowmya Rao','Independent scoring achieved'),
  ('9000000105',-5,'Controlled movement',3,4,'Venu Muppala','Quality stayed stable at reduced volume'),
  ('9000000106',-2,'Return-to-play footwork',3,3,'Karthik Reddy','No symptoms reported during planned block'),
  ('9000000108',-2,'Advanced match patterns',5,4,'Venu Muppala','Placement level validated under pressure')
) v(phone,day_offset,focus,effort,movement,coach,note) join public.members m on m.tenant_id='matchpoint' and m.phone=v.phone;

insert into public.development_reviews(tenant_id,member_id,scheduled_on,completed_at,outcome,next_review_on,coach_name,notes)
select 'matchpoint',m.id,current_date+v.day_offset,now()+(v.day_offset||' days')::interval,v.outcome,current_date+v.next_offset,v.coach,v.notes
from (values
  ('9000000101',-4,'continue',30,'Karthik Reddy','Accelerated learner; protect decision quality while increasing pace'),
  ('9000000103',-3,'promote',20,'Sowmya Rao','Required Foundation gate complete; optional rules check remains'),
  ('9000000105',-12,'adjust-plan',10,'Venu Muppala','Maintain skill pathway with controlled volume'),
  ('9000000106',-8,'return-to-play',7,'Karthik Reddy','Progressive return plan active')
) v(phone,day_offset,outcome,next_offset,coach,notes) join public.members m on m.tenant_id='matchpoint' and m.phone=v.phone;

insert into public.progress_notes(tenant_id,member_id,note_type,note,coach_name,noted_at)
select 'matchpoint',m.id,v.note_type,v.note,v.coach,now()+(v.day_offset||' days')::interval
from (values
  ('9000000101','assessment','Fast tactical uptake; keep first attack patient','Karthik Reddy',-4),
  ('9000000102','action','Plateau alert: schedule one-to-one movement review','Sowmya Rao',-10),
  ('9000000103','assessment','Required Foundation competencies complete','Sowmya Rao',-3),
  ('9000000104','assessment','Tournament plan: protect forehand rear corner under fatigue','Venu Muppala',-2),
  ('9000000105','safety','Load guidance shared with all assigned coaches','Venu Muppala',-7),
  ('9000000106','safety','Return-to-play constraints reviewed before each session','Karthik Reddy',-2),
  ('9000000107','action','Baseline assessment due after first two weeks','Sowmya Rao',-7),
  ('9000000108','assessment','Transfer placement validated in match conditions','Venu Muppala',-2),
  ('9000000109','general','Pathway paused; retain level and resume after exams','Sowmya Rao',-35)
) v(phone,note_type,note,coach,day_offset) join public.members m on m.tenant_id='matchpoint' and m.phone=v.phone;
