-- Ejecutar después de crear ambos usuarios en Authentication > Users.
-- Si usaste correos diferentes, reemplázalos antes de ejecutar.

-- 1. Convertir la cuenta de Ana López en médico y vincularla con doc-ana.
update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
  'role', 'doctor',
  'doctor_id', 'doc-ana',
  'full_name', 'Dra. Ana López',
  'identification', 'MED-001'
)
where email = 'ana.lopez@saludconecta.ec';

update public.doctors
set user_id = (
  select id from auth.users where email = 'ana.lopez@saludconecta.ec'
)
where id = 'doc-ana';

-- 2. Convertir la cuenta administrativa en administrador.
update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
  'role', 'admin',
  'full_name', 'Administrador SaludConecta',
  'identification', 'ADMIN-001'
)
where email = 'admin@saludconecta.ec';

-- 3. Verificación: deben aparecer doctor y admin.
select
  email,
  raw_user_meta_data ->> 'full_name' as nombre,
  raw_user_meta_data ->> 'role' as rol,
  raw_user_meta_data ->> 'doctor_id' as doctor_id
from auth.users
where email in ('ana.lopez@saludconecta.ec', 'admin@saludconecta.ec')
order by email;
