-- Match Point tenant bootstrap — one brand, venue-ready from day one.
-- Current live scope: Manikonda only. A second venue can be appended to
-- config.venues and config.courts without creating another tenant.

insert into tenants (id, name, config) values
  ('matchpoint', 'Match Point Badminton Academy',
   '{
      "brand":"Match Point",
      "tagline":"It''s Next Level",
      "city":"Hyderabad",
      "features":{"playerTracking":true,"coachMonitoring":true,"developmentReviews":true},
      "courts":{"manikonda":3},
      "rates":{"manikonda":{"offPeak":350,"peak":450},"peakFrom":17},
      "billing":{"payee":"Match Point Badminton Academy","upiIds":["7732077327@ybl"],"upiWindowDays":5},
      "venues":{
        "manikonda":{
          "name":"Match Point · Manikonda",
          "full":"Match Point (It''s Next Level)",
          "area":"Alkapur Township · Manikonda",
          "address":"Plot 131, Block B, Sector II, Survey 235, Road 14, Alkapur Township, Puppalguda, Telangana 500089",
          "phone":"+91 77320 77327",
          "hours":"9 AM – 12 midnight",
          "prefix":"M",
          "courts":3
        }
      }
    }'::jsonb)
on conflict (id) do update set
  name = excluded.name,
  config = excluded.config;

insert into subscriptions (tenant_id, plan, mrr, status, started, renews_on, notes) values
  ('matchpoint', 'standard', 4000, 'trial', current_date, current_date + 30,
   'Match Point pitch tenant · Manikonda venue · second venue ready')
on conflict (tenant_id) do update set
  plan = excluded.plan,
  status = excluded.status,
  renews_on = excluded.renews_on,
  notes = excluded.notes;

insert into integrations (tenant_id, channel, enabled, config) values
  ('matchpoint', 'Playo', true,
   '{"method":"manual","venues":{"manikonda":"playo:match-point-its-next-level-manikonda"}}'),
  ('matchpoint', 'Website', true,
   '{"method":"native","venues":{"manikonda":"matchpoint-web"}}')
on conflict (tenant_id, channel) do update set
  enabled = excluded.enabled,
  config = excluded.config;

-- Provision staff through the Supabase Auth admin API or dashboard, then set
-- app_metadata to {"am_role":"staff","tenant_id":"matchpoint"}. Passwords
-- deliberately do not live in source-controlled migration files.
