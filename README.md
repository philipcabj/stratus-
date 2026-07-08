# Stratus — Panel Multicloud Multi-tenant

Panel SaaS B2B para que un reseller de cloud (telco/partner) monitoree el consumo de infraestructura de sus clientes en AWS, Azure, GCP y OCI.

## Prerrequisitos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com) con un proyecto creado

## Instalación

```bash
# Clonar el repo y entrar al directorio
cd Stratus

# Instalar dependencias
npm install

# Copiar variables de entorno (ya están en .env.local)
# Verificar que los valores sean correctos
```

## Variables de entorno

En `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

## Aplicar migraciones

### Opción A — Supabase Studio (recomendado para Fase 1)

1. Ir a [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto → **SQL Editor**
2. Copiar y ejecutar el contenido de `supabase/migrations/00001_schema.sql`
3. Copiar y ejecutar el contenido de `supabase/migrations/00002_rls.sql`

### Opción B — Supabase CLI

```bash
supabase link --project-ref <project-ref>
supabase db push
```

## Crear usuarios de prueba

En Supabase Dashboard → **Authentication → Users**, crear los siguientes usuarios:

| Email | Contraseña | Rol |
|---|---|---|
| `admin@stratus.io` | `Admin1234!` | platform_admin |
| `cliente@finanzassur.com` | `Cliente1234!` | tenant_admin |

Después de crear los usuarios, anotar sus UUIDs y actualizar el seed:

```sql
-- En supabase/seed.sql, reemplazar estas líneas con los UUIDs reales:
-- '00000000-0000-0000-0000-000000000001' → UUID de admin@stratus.io
-- '00000000-0000-0000-0000-000000000002' → UUID de cliente@finanzassur.com
```

## Cargar datos de prueba (seed)

Una vez actualizados los UUIDs en el seed, ejecutar en SQL Editor de Supabase:

```sql
-- Pegar y ejecutar el contenido de supabase/seed.sql
```

## Levantar el proyecto

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). Se redirigirá a `/login`.

## Usuarios de prueba

| Usuario | Contraseña | Acceso |
|---|---|---|
| `admin@stratus.io` | `Admin1234!` | Vista admin completa · todos los clientes |
| `cliente@finanzassur.com` | `Cliente1234!` | Vista cliente · solo Finanzas del Sur |

### Flujo de impersonación

1. Ingresar como `admin@stratus.io`
2. En la tabla de clientes, hacer clic en **"Ver como cliente"** en cualquier fila
3. Se abre la vista cliente con un banner amarillo "Solo lectura"
4. Hacer clic en **"Volver a admin"** para regresar

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/login/         # Página de login
│   ├── admin/                # Vista platform_admin
│   └── dashboard/            # Vista tenant (también usada en impersonación)
├── components/
│   ├── admin/                # TenantTable, AlertPanel
│   ├── charts/               # MonthlyStackedBar, ClientAreaChart, ProviderDonut
│   └── ui/                   # Sidebar, Card, KpiCard, CloudChip, ImpersonationBanner
├── context/                  # ImpersonationContext (para uso futuro)
├── lib/
│   ├── supabase/             # Clientes browser y server
│   ├── constants.ts          # Colores por proveedor, design tokens
│   ├── types.ts              # Tipos TypeScript
│   └── utils.ts              # fmt(), calcTrend(), projectEndOfMonth()
└── middleware.ts              # Auth guard + routing por rol
supabase/
├── migrations/
│   ├── 00001_schema.sql      # Tablas e índices
│   └── 00002_rls.sql         # Row Level Security policies
└── seed.sql                  # Datos dummy (5 tenants, 6 meses)
```

## Stack técnico

- **Next.js 15** con App Router y TypeScript
- **Supabase** — Auth, Postgres, Row Level Security
- **Tailwind CSS** con tokens del mockup aprobado
- **Recharts** — gráficos (stacked bar, area, donut)
- **lucide-react** — íconos
- **Fuentes** — Archivo, IBM Plex Sans, IBM Plex Mono (Google Fonts)
