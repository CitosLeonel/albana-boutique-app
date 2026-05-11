# Albana Boutique — CRM / ERP

Sistema de gestión para tienda de indumentaria. Maneja ventas, compras, stock, flujo de caja, clientes y proveedores. Backend en Supabase (PostgreSQL + Auth).

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | HTML + CSS + JavaScript vanilla |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth (bcrypt server-side) |
| Hosting sugerido | Netlify / Vercel / GitHub Pages |

---

## Estructura del proyecto

```
albana-boutique-erp/
│
├── index.html                  # Entry point — solo estructura HTML y modales
│
├── src/
│   ├── main.js                 # Bootstrap: inicializa sesión, muestra pantalla, listeners globales
│   │
│   ├── config/
│   │   └── supabase.js         # Cliente Supabase (URL + anon key)
│   │
│   ├── auth/
│   │   ├── login.js            # doLogin(), doLogout(), protección anti fuerza bruta
│   │   └── session.js          # loadUserProfile(), manejo de sesión activa
│   │
│   ├── router/
│   │   └── index.js            # nav(), renderView() — dispatcher de vistas
│   │
│   ├── views/
│   │   ├── dashboard.js        # KPIs del mes, últimas ventas, stock crítico
│   │   ├── ventas.js           # renderVentas(), saveVenta(), deleteVenta()
│   │   ├── compras.js          # renderCompras(), saveCompra(), deleteCompra()
│   │   ├── stock.js            # renderStock(), saveProducto(), saveAjuste()
│   │   ├── caja.js             # renderCaja(), saveMov(), deleteMov()
│   │   ├── clientes.js         # renderClientes(), saveCliente()
│   │   ├── proveedores.js      # renderProveedores(), saveProveedor()
│   │   └── usuarios.js         # renderUsuarios(), saveUsuario() — solo admin
│   │
│   ├── services/
│   │   └── db.js               # fetchAll(), insert(), update(), remove()
│   │
│   ├── components/
│   │   ├── sidebar.js          # toggleSidebar(), closeSidebar()
│   │   ├── modals.js           # openModal(), closeModal(), populate modales
│   │   └── toast.js            # toast(), setBtnLoading()
│   │
│   └── utils/
│       ├── formatters.js       # fmt() — moneda argentina, today() — fecha local
│       ├── filters.js          # filterTable(), filterCaja()
│       └── theme.js            # toggleTheme(), initTheme(), applyTheme()
│
├── styles/
│   ├── main.css                # Variables CSS (:root + dark), reset, tipografía de marca
│   ├── layout.css              # Sidebar, main-content, mobile header, responsive
│   ├── components.css          # Botones, formularios, badges, tablas, modales, toast
│   ├── views.css               # Stats grid, stock grid, caja chart
│   └── animations.css          # Keyframes: fadeIn, slideUp, spin
│
├── supabase/
│   ├── schema.sql              # Definición de tablas (ejecutar primero)
│   ├── triggers.sql            # handle_new_user(), is_admin()
│   ├── rls.sql                 # Row Level Security por rol
│   └── seed.sql                # Datos de ejemplo para desarrollo
│
├── .env.example                # Plantilla de variables de entorno
├── .gitignore
└── README.md
```

---

## Configuración inicial

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/albana-boutique-crm.git
cd albana-boutique-crm
```

### 2. Crear el proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) y crear un proyecto nuevo.
2. En **SQL Editor**, ejecutar los archivos en este orden:
   ```
   supabase/schema.sql
   supabase/triggers.sql
   supabase/rls.sql
   supabase/seed.sql   ← opcional, solo para desarrollo
   ```

### 3. Configurar credenciales

Editar `src/config/supabase.js` con los valores de tu proyecto:

```js
const SUPABASE_URL      = 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON_KEY = 'tu_anon_key';
```

> **Nota:** Si usás Vite, mové los valores a `.env` y reemplazalos por `import.meta.env.VITE_SUPABASE_URL`.

### 4. Crear el primer usuario admin

En **Supabase → Authentication → Users → Invite User**, creá un usuario con tu email. Luego en el SQL Editor actualizá su rol:

```sql
update user_profiles set role = 'admin' where email = 'tu@email.com';
```

### 5. Abrir el proyecto

Con cualquier servidor local (VS Code Live Server, o `npx serve .`) apuntar a `index.html`.

---

## Módulos del sistema

| Módulo | Descripción |
|---|---|
| **Dashboard** | KPIs del mes (ventas, compras, saldo, stock crítico), últimas ventas y productos con stock bajo |
| **Ventas** | Registro de ventas con cliente, producto, cantidad, precio y método de pago. Descuenta stock automáticamente |
| **Compras** | Carga de mercadería nueva o reposición de stock existente. Genera egreso en caja automáticamente |
| **Stock** | Inventario en tarjetas con barra de nivel. Filtro por categoría. Ajuste manual de stock |
| **Flujo de Caja** | Ingresos y egresos manuales + automáticos (ventas/compras). Gráfico de barras de 7 días |
| **Clientes** | Directorio con historial de compras y monto total por cliente |
| **Proveedores** | Directorio de contactos con rubro y conteo de órdenes |
| **Usuarios** | Alta, edición y baja de usuarios del sistema. Solo accesible para administradores |

---

## Roles y permisos

| Acción | Vendedor | Admin |
|---|---|---|
| Ver / crear ventas, compras, movimientos | ✅ | ✅ |
| Ver / editar stock y productos | ✅ | ✅ |
| Eliminar registros | ❌ | ✅ |
| Gestionar usuarios | ❌ | ✅ |

Los permisos están reforzados en el servidor mediante **Row Level Security (RLS)** de PostgreSQL, no solo en el cliente.

---

## Seguridad

- **Autenticación:** Supabase Auth — contraseñas hasheadas con bcrypt en el servidor. Nunca se almacenan en texto plano.
- **Sesión:** JWT con refresh automático. El cierre de sesión en una pestaña afecta a todas.
- **RLS:** Cada tabla tiene políticas que verifican el rol del usuario autenticado en el servidor.
- **Anti fuerza bruta:** 5 intentos fallidos bloquean el login por 5 minutos (sessionStorage).
- **Anon key:** La clave pública de Supabase es segura de exponer en el frontend; el acceso real está controlado por RLS.

---

## Decisiones de arquitectura

**¿Por qué JavaScript vanilla y no React/Vue?**
El proyecto prioriza cero dependencias de build, despliegue simple (cualquier hosting estático) y facilidad de mantenimiento por perfiles no especializados en frontend frameworks.

**¿Por qué `services/db.js`?**
Centraliza todas las operaciones de base de datos. Si en el futuro se migra a otra DB o se agrega caché, el cambio ocurre en un solo lugar.

**¿Por qué separar los CSS en 5 archivos?**
Cada archivo tiene una responsabilidad clara. Al buscar un estilo, el nombre del archivo indica dónde está: `layout.css` para estructura, `components.css` para elementos reutilizables, etc.

---

## Licencia

MIT — libre para uso personal y comercial.
