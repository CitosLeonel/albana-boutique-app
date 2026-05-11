-- ============================================================
-- supabase/seed.sql
-- Datos de ejemplo para desarrollo y demo.
-- Ejecutar solo en entornos de desarrollo.
-- ============================================================

insert into productos (nombre, categoria, stock, costo, precio, stock_min) values
  ('Remera Básica Blanca M', 'Remeras',    12, 2500,  5500, 3),
  ('Jean Slim Azul 38',      'Pantalones',  5, 8000, 18000, 2),
  ('Vestido Floral S',       'Vestidos',    2, 9000, 22000, 3),
  ('Campera Negra M',        'Camperas',    8,12000, 28000, 2),
  ('Remera Oversize L',      'Remeras',     1, 3000,  7000, 3)
on conflict do nothing;
