-- Subscription-based billing model
-- Tracks free prompts used and subscription status

alter table profiles add column if not exists free_prompts_used integer not null default 0;
alter table profiles add column if not exists subscription_status text default 'none'; -- none, active, canceled
alter table profiles add column if not exists subscription_id text;
alter table profiles add column if not exists stripe_customer_id text;
alter table profiles add column if not exists subscription_started_at timestamptz;
alter table profiles add column if not exists subscription_ends_at timestamptz;

-- Drop old daily quota columns
alter table profiles drop column if exists prompt_day;
alter table profiles drop column if exists prompts_today;
