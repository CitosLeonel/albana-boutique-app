-- ============================================================
-- supabase/schema.sql
-- Definición de todas las tablas del sistema.
-- Ejecutar primero, antes que rls.sql y triggers.sql.
-- ============================================================

create table if not exists user_profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  role       text not null default 'vendedor' check (role in ('admin', 'vendedor')),
  email      text,
  created_at timestamptz default now()
);

create table if not exists productos (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  categoria  text not null default 'Otro',
  stock      integer not null default 0 check (stock >= 0),
  costo      numeric(12,2) not null default 0,
  precio     numeric(12,2) not null default 0,
  stock_min  integer not null default 3,
  created_at timestamptz default now()
);

create table if not exists clientes (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  telefono   text,
  email      text,
  instagram  text,
  notas      text,
  created_at timestamptz default now()
);

create table if not exists proveedores (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  telefono   text,
  email      text,
  whatsapp   text,
  rubro      text,
  notas      text,
  created_at timestamptz default now()
);

create table if not exists ventas (
  id          uuid primary key default gen_random_uuid(),
  fecha       date not null default current_date,
  producto_id uuid references productos(id) on delete set null,
  cliente_id  uuid references clientes(id) on delete set null,
  cant        integer not null default 1 check (cant > 0),
  precio      numeric(12,2) not null default 0,
  pago        text not null default 'Efectivo',
  notas       text,
  vendedor    text,
  user_id     uuid references auth.users(id) on delete set null,
  created_at  timestamptz default now()
);

create table if not exists compras (
  id           uuid primary key default gen_random_uuid(),
  fecha        date not null default current_date,
  producto_id  uuid references productos(id) on delete set null,
  proveedor_id uuid references proveedores(id) on delete set null,
  cant         integer not null default 1 check (cant > 0),
  costo        numeric(12,2) not null default 0,
  notas        text,
  user_id      uuid references auth.users(id) on delete set null,
  created_at   timestamptz default now()
);

create table if not exists caja (
  id          uuid primary key default gen_random_uuid(),
  fecha       date not null default current_date,
  tipo        text not null check (tipo in ('ingreso', 'egreso')),
  descripcion text not null,
  monto       numeric(12,2) not null default 0,
  categoria   text,
  user_id     uuid references auth.users(id) on delete set null,
  created_at  timestamptz default now()
);
