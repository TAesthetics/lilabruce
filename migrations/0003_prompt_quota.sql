alter table profiles add column if not exists prompt_day date;
alter table profiles add column if not exists prompts_today integer not null default 0;
