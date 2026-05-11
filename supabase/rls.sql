-- ============================================================
-- supabase/rls.sql
-- Row Level Security: habilita RLS en todas las tablas y
-- define políticas de acceso por rol.
-- Ejecutar después de schema.sql y triggers.sql.
-- ============================================================

-- Habilitar RLS
alter table user_profiles enable row level security;
alter table productos      enable row level security;
alter table clientes       enable row level security;
alter table proveedores    enable row level security;
alter table ventas         enable row level security;
alter table compras        enable row level security;
alter table caja           enable row level security;

-- Limpiar políticas existentes para evitar conflictos
do $$ declare r record; begin
  for r in select policyname, tablename from pg_policies
    where schemaname = 'public'
    and tablename in ('user_profiles','productos','clientes','proveedores','ventas','compras','caja')
  loop
    execute format('drop policy if exists %I on %I', r.policyname, r.tablename);
  end loop;
end $$;

-- ── user_profiles ──
-- Cada usuario ve su propio perfil; admin ve todos
create policy "up_select" on user_profiles for select
  using (id = auth.uid() or is_admin());
create policy "up_insert" on user_profiles for insert
  with check (true); -- el trigger lo necesita
create policy "up_update" on user_profiles for update
  using (is_admin());
create policy "up_delete" on user_profiles for delete
  using (is_admin());

-- ── productos ── (cualquier usuario autenticado lee/escribe; solo admin elimina)
create policy "prod_s" on productos for select using (auth.uid() is not null);
create policy "prod_i" on productos for insert with check (auth.uid() is not null);
create policy "prod_u" on productos for update using (auth.uid() is not null);
create policy "prod_d" on productos for delete using (is_admin());

-- ── clientes ──
create policy "cli_s" on clientes for select using (auth.uid() is not null);
create policy "cli_i" on clientes for insert with check (auth.uid() is not null);
create policy "cli_u" on clientes for update using (auth.uid() is not null);
create policy "cli_d" on clientes for delete using (is_admin());

-- ── proveedores ──
create policy "prov_s" on proveedores for select using (auth.uid() is not null);
create policy "prov_i" on proveedores for insert with check (auth.uid() is not null);
create policy "prov_u" on proveedores for update using (auth.uid() is not null);
create policy "prov_d" on proveedores for delete using (is_admin());

-- ── ventas ──
create policy "ven_s" on ventas for select using (auth.uid() is not null);
create policy "ven_i" on ventas for insert with check (auth.uid() is not null);
create policy "ven_d" on ventas for delete using (is_admin());

-- ── compras ──
create policy "comp_s" on compras for select using (auth.uid() is not null);
create policy "comp_i" on compras for insert with check (auth.uid() is not null);
create policy "comp_d" on compras for delete using (is_admin());

-- ── caja ──
create policy "caja_s" on caja for select using (auth.uid() is not null);
create policy "caja_i" on caja for insert with check (auth.uid() is not null);
create policy "caja_d" on caja for delete using (is_admin());
