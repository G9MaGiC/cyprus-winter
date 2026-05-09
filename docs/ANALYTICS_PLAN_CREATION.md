## Plan creation analytics (conversion_events)

This app posts events to `POST /api/track`, which stores to Supabase table `conversion_events` with:

- `event` (text)
- `properties` (jsonb)
- `session_id` (text)
- plus whatever timestamp column your table uses (commonly `created_at`)

### Recommended events (product metrics, always-on)

- `plan_add`
- `plan_view`
- `plan_remove`
- `plan_share`
- `plan_template_apply`
- (optional) `plan_day_change`

### Weekly queries (SQL)

Replace `created_at` with your timestamp column name if different.

#### PlanAddRate (sessions with ≥1 add)

```sql
select count(distinct session_id) as sessions_with_plan_add
from conversion_events
where event = 'plan_add'
  and created_at >= now() - interval '7 days';
```

#### PlanActivation (added then viewed plan)

```sql
with adds as (
  select distinct session_id
  from conversion_events
  where event = 'plan_add'
    and created_at >= now() - interval '7 days'
),
views as (
  select distinct session_id
  from conversion_events
  where event = 'plan_view'
    and created_at >= now() - interval '7 days'
)
select
  (select count(*) from adds) as sessions_with_add,
  (select count(*) from views) as sessions_with_plan_view,
  (select count(*) from adds a join views v using (session_id)) as add_then_view;
```

#### PlanDepth (distribution of item counts at plan view)

```sql
select
  coalesce((properties->>'item_count')::int, 0) as item_count,
  count(*) as views
from conversion_events
where event = 'plan_view'
  and created_at >= now() - interval '7 days'
group by 1
order by 1 asc;
```

#### PlanShareRate (share actions per plan view sessions)

```sql
with share_sessions as (
  select distinct session_id
  from conversion_events
  where event = 'plan_share'
    and created_at >= now() - interval '7 days'
),
view_sessions as (
  select distinct session_id
  from conversion_events
  where event = 'plan_view'
    and created_at >= now() - interval '7 days'
)
select
  (select count(*) from share_sessions) as sessions_with_share,
  (select count(*) from view_sessions) as sessions_with_plan_view,
  (select count(*) from share_sessions s join view_sessions v using (session_id)) as share_and_view;
```

#### AI contribution (adds with `source = 'ai'`)

```sql
select count(*) as ai_plan_adds
from conversion_events
where event = 'plan_add'
  and properties->>'source' = 'ai'
  and created_at >= now() - interval '7 days';
```

