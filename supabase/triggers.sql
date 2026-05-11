-- ============================================================
-- supabase/triggers.sql
-- Trigger para crear el perfil automáticamente al registrar
-- un usuario en Supabase Auth, y helper is_admin() para RLS.
-- Ejecutar después de schema.sql y antes de rls.sql.
-- ============================================================

-- Helper: devuelve true si el usuario autenticado es admin
create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from user_profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Función que se ejecuta al crear un usuario en auth.users
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles (id, name, role, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'vendedor'),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Crear/reemplazar el trigger en auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
