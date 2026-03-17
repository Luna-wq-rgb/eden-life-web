create extension if not exists pgcrypto;

create table if not exists public.whitelist_applications (
  id uuid primary key default gen_random_uuid(),
  rp_name text not null,
  real_age text not null,
  character_age text not null,
  email text not null,
  discord_id text not null,
  discord_user text not null,
  experience text not null,
  rdm text not null,
  vdm text not null,
  metagaming text not null,
  powergaming text not null,
  serious_roleplay text not null,
  accepted_rules boolean not null default false,
  allowed_failures integer not null default 1,
  status text not null default 'pendiente' check (status in ('pendiente', 'aprobada', 'rechazada')),
  admin_note text,
  created_at timestamptz not null default now()
);
