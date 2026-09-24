create table if not exists mail_outbox (
  id text primary key,
  recipient text not null,
  subject text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists mail_outbox_recipient_idx on mail_outbox (recipient, created_at desc);
