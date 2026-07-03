-- SaludConecta: actualización para habilitar el portal médico.
-- Ejecutar una sola vez en Supabase > SQL Editor.

alter table public.doctors
  add column if not exists user_id uuid unique references auth.users(id) on delete set null;

alter table public.appointments
  add column if not exists diagnosis text not null default '',
  add column if not exists indications text not null default '',
  add column if not exists prescription text not null default '';

drop policy if exists "admins_update_doctors" on public.doctors;
create policy "admins_or_owner_update_doctors"
  on public.doctors for update
  to authenticated
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or user_id = auth.uid()
  )
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or user_id = auth.uid()
  );

drop policy if exists "users_read_own_appointments" on public.appointments;
create policy "authorized_users_read_appointments"
  on public.appointments for select
  to authenticated
  using (
    auth.uid() = user_id
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'doctor'
      and doctor_id = (auth.jwt() -> 'user_metadata' ->> 'doctor_id')
    )
  );

drop policy if exists "users_update_own_appointments" on public.appointments;
create policy "authorized_users_update_appointments"
  on public.appointments for update
  to authenticated
  using (
    auth.uid() = user_id
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'doctor'
      and doctor_id = (auth.jwt() -> 'user_metadata' ->> 'doctor_id')
    )
  )
  with check (
    auth.uid() = user_id
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'doctor'
      and doctor_id = (auth.jwt() -> 'user_metadata' ->> 'doctor_id')
    )
  );

-- Después de crear el usuario médico desde Authentication > Users,
-- sustituye el correo si fuera necesario y ejecuta este bloque:
--
-- update auth.users
-- set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
--   'role', 'doctor',
--   'doctor_id', 'doc-ana',
--   'full_name', 'Dra. Ana López',
--   'identification', 'MED-001'
-- )
-- where email = 'doctora.ana@saludconecta.ec';
--
-- update public.doctors
-- set user_id = (select id from auth.users where email = 'doctora.ana@saludconecta.ec')
-- where id = 'doc-ana';
