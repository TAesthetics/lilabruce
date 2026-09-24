-- TEMPLE // WIRED — operator profiles, engagements, IAP, ritual logs

create table if not exists profiles (
  user_id text primary key,
  handle text,
  venice_key text not null default '',
  credits integer not null default 20,
  pro_until timestamptz,
  entitlements jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists engagements (
  id text primary key,
  user_id text not null,
  name text not null,
  client text not null default '',
  scope text not null default '',
  notes text not null default '',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists engagements_user_id_idx on engagements (user_id);

create table if not exists history (
  id text primary key,
  user_id text not null,
  engagement_id text,
  kind text not null,
  target text not null default '',
  content text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists history_user_id_idx on history (user_id, created_at desc);

create table if not exists prayers (
  id serial primary key,
  user_id text not null,
  event text not null,
  agent text not null,
  message text not null,
  created_at timestamptz not null default now()
);
create index if not exists prayers_user_id_idx on prayers (user_id, id desc);

create table if not exists agent_results (
  user_id text not null,
  kind text not null,
  target text not null default '',
  content text not null default '',
  created_at timestamptz not null default now(),
  primary key (user_id, kind)
);

create table if not exists loop_state (
  user_id text primary key,
  running boolean not null default false,
  current_phase text not null default 'idle',
  cycle integer not null default 0,
  target text not null default 'localhost',
  current_engagement_id text,
  stats_cycles integer not null default 0,
  stats_vulns integer not null default 0,
  stats_exploits integer not null default 0,
  stats_detections integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists purchases (
  id text primary key,
  user_id text not null,
  product_id text not null,
  platform text not null,
  store_txn_id text,
  status text not null default 'pending',
  credits_granted integer not null default 0,
  created_at timestamptz not null default now()
);
create unique index if not exists purchases_txn_idx
  on purchases (store_txn_id) where store_txn_id is not null;
create index if not exists purchases_user_id_idx on purchases (user_id, created_at desc);

create table if not exists feedback (
  id text primary key,
  user_id text not null,
  rating integer,
  category text not null default 'general',
  message text not null,
  created_at timestamptz not null default now()
);
create index if not exists feedback_user_id_idx on feedback (user_id);
