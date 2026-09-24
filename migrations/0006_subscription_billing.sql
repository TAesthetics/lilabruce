-- Subscription-based billing model
-- 20 free prompts per day, then €20/month subscription required

alter table profiles add column if not exists prompts_today integer not null default 0;
alter table profiles add column if not exists prompt_day date;
alter table profiles add column if not exists subscription_status text default 'none'; -- none, active, canceled
alter table profiles add column if not exists subscription_id text;
alter table profiles add column if not exists stripe_customer_id text;
alter table profiles add column if not exists subscription_started_at timestamptz;
alter table profiles add column if not exists subscription_ends_at timestamptz;
