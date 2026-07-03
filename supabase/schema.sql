-- SaludConecta: esquema inicial para Supabase
-- Ejecutar completo desde SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.doctors (
  id text primary key,
  name text not null,
  specialty text not null,
  bio text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  available boolean not null default true,
  color text not null default '#cfe5ff',
  slots text[] not null default '{}',
  user_id uuid unique references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  relationship text not null,
  birth_date date not null,
  identification text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  patient_name text not null,
  doctor_id text not null references public.doctors(id),
  doctor_name text not null,
  specialty text not null,
  date date not null,
  time time not null,
  reason text not null default '',
  insurance text not null default 'Atención particular',
  total numeric(10, 2) not null check (total >= 0),
  status text not null default 'confirmed'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  paid boolean not null default false,
  room_name text not null unique,
  diagnosis text not null default '',
  indications text not null default '',
  prescription text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists family_members_user_id_idx
  on public.family_members(user_id);
create index if not exists appointments_user_id_date_idx
  on public.appointments(user_id, date desc);

alter table public.doctors enable row level security;
alter table public.family_members enable row level security;
alter table public.appointments enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.doctors to anon, authenticated;
grant update (available) on public.doctors to authenticated;
grant select, insert, update, delete on public.family_members to authenticated;
grant select, insert, update, delete on public.appointments to authenticated;

drop policy if exists "doctors_are_public" on public.doctors;
create policy "doctors_are_public"
  on public.doctors for select
  to anon, authenticated
  using (true);

drop policy if exists "admins_update_doctors" on public.doctors;
create policy "admins_update_doctors"
  on public.doctors for update
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

drop policy if exists "users_read_own_family" on public.family_members;
create policy "users_read_own_family"
  on public.family_members for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users_add_own_family" on public.family_members;
create policy "users_add_own_family"
  on public.family_members for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users_update_own_family" on public.family_members;
create policy "users_update_own_family"
  on public.family_members for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users_delete_own_family" on public.family_members;
create policy "users_delete_own_family"
  on public.family_members for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users_read_own_appointments" on public.appointments;
create policy "users_read_own_appointments"
  on public.appointments for select
  to authenticated
  using (
    auth.uid() = user_id
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

drop policy if exists "users_add_own_appointments" on public.appointments;
create policy "users_add_own_appointments"
  on public.appointments for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users_update_own_appointments" on public.appointments;
create policy "users_update_own_appointments"
  on public.appointments for update
  to authenticated
  using (
    auth.uid() = user_id
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  with check (
    auth.uid() = user_id
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

drop policy if exists "users_delete_own_appointments" on public.appointments;
create policy "users_delete_own_appointments"
  on public.appointments for delete
  to authenticated
  using (
    auth.uid() = user_id
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

insert into public.doctors
  (id, name, specialty, bio, price, available, color, slots)
values
  ('doc-ana', 'Dra. Ana López', 'Medicina General',
   'Atención integral para adultos y seguimiento de enfermedades comunes.',
   40, true, '#cfe5ff', array['09:00', '09:30', '10:00', '11:00', '14:30']),
  ('doc-carlos', 'Dr. Carlos Mendoza', 'Cardiología',
   'Valoración cardiovascular, hipertensión y seguimiento de resultados.',
   50, true, '#d8e2ff', array['08:30', '10:30', '15:00', '16:30']),
  ('doc-maria', 'Dra. María Gómez', 'Pediatría',
   'Consulta pediátrica, orientación familiar y controles de seguimiento.',
   45, true, '#d8f3f5', array['09:00', '11:30', '14:00', '17:00']),
  ('doc-javier', 'Dr. Javier Méndez', 'Dermatología',
   'Evaluación inicial de afecciones de piel y seguimiento de tratamientos.',
   45, false, '#f1e3ff', array['10:00', '12:00', '16:00'])
on conflict (id) do update set
  name = excluded.name,
  specialty = excluded.specialty,
  bio = excluded.bio,
  price = excluded.price,
  available = excluded.available,
  color = excluded.color,
  slots = excluded.slots;
