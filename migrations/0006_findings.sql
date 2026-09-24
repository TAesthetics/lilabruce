create table if not exists findings (
  id text primary key,
  user_id text not null,
  target text not null default '',
  source text not null default 'note',
  title text not null,
  severity text not null default 'info',
  status text not null default 'open',
  tactic text not null default '',
  detail text not null default '',
  next_step text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists findings_user_idx on findings (user_id, created_at desc);
