# Credere — Tareas del MVP (versión Vanilla)

> Adaptación de `TAREAS.md` (Stack Next.js + TypeScript) mudado a **HTML + CSS + JS vanilla**, sin Node ni build.
> **Correspondencias:** API Routes → módulos `js/*.js` con `supabase-js` directo · Middleware → `requireSessionOrRedirect()` en `js/utils.js` · Componentes React → páginas HTML + funciones de render en cada módulo.
> **Estados:** `Pendiente` → `En progreso` → `En review` → `Completado`
> **Flujo central:** registro de cliente → crear préstamo → registrar pago → buscar.

---

## Fase 0: Configuración del proyecto (sin Node)

| # | Tarea | Prioridad | Asignado | Estado |
|---|-------|-----------|----------|--------|
| 0.1 | Crear repositorio en GitHub | Alta | — | Pendiente |
| 0.2 | Copiar `credere-vanilla-starter/` como base (no instalar nada) | Alta | — | Pendiente |
| 0.3 | Cargar Tailwind por CDN (`<script src="https://cdn.tailwindcss.com">`) en cada página | Alta | — | Pendiente |
| 0.4 | Crear `js/config.js` con `SUPABASE_URL` y `SUPABASE_ANON_KEY` del panel de Supabase | Alta | — | Pendiente |
| 0.5 | Crear `js/supabaseClient.js` como ÚNICO punto de inicialización (prohibido duplicar) | Alta | — | Pendiente |
| 0.6 | Ejecutar `sql/schema.sql` en Supabase SQL Editor y verificar RLS activado | Alta | — | Pendiente |
| 0.7 | Crear `.env.example` solo con URL + anon key y advertencia NUNCA `service_role` en frontend | Alta | — | Pendiente |
| 0.8 | Publicar prueba en Vercel o GitHub Pages como sitio estático (sin build) | Media | — | Pendiente |

---

## Fase 1: Autenticación

| # | Tarea | Prioridad | Asignado | Estado |
|---|-------|-----------|----------|--------|
| 1.1 | Habilitar Supabase Auth email/password en el panel | Alta | — | Pendiente |
| 1.2 | Página `login.html` (email/password, error visible, redirección si ya hay sesión) | Alta | — | Pendiente |
| 1.3 | Página `register.html` (email/password + full_name en `user_metadata`) | Alta | — | Pendiente |
| 1.4 | Guardia `requireSessionOrRedirect()` en `js/utils.js`, aplicada en cada página protegida | Alta | — | Pendiente |
| 1.5 | Botón cerrar sesión con `supabase.auth.signOut()` + redirección a `login.html` | Alta | — | Pendiente |

---

## Fase 2: Layout y navegación

| # | Tarea | Prioridad | Asignado | Estado |
|---|-------|-----------|----------|--------|
| 2.1 | Sidebar simple en HTML/CSS (sin componentes): Panel / Clientes / Préstamos / Búsqueda | Alta | — | Pendiente |
| 2.2 | Encabezado con saludo (`user_metadata.full_name`) + fecha en español | Alta | — | Pendiente |
| 2.3 | Estructura común `div.app > aside + main` replicada en cada página protegida | Alta | — | Pendiente |
| 2.4 | Enlaces del sidebar con `aria-current` en la página activa | Alta | — | Pendiente |
| 2.5 | Estado activo con borde lateral dorado (`nav-active`) | Media | — | Pendiente |
| 2.6 | Sidebar responsive (pasa a barra superior en móvil, ver `styles.css`) | Media | — | Pendiente |

---

## Fase 3: Clientes

| # | Tarea | Prioridad | Asignado | Estado |
|---|-------|-----------|----------|--------|
| 3.1 | Tablas `profiles` + `clients` creadas desde `sql/schema.sql` | Alta | — | Pendiente |
| 3.2 | Módulo `js/clients.js`: `listClients(search)` filtrado por `user_id` | Alta | — | Pendiente |
| 3.3 | Módulo `js/clients.js`: `createClient()` con validación (full_name, phone, gov_id obligatorios) | Alta | — | Pendiente |
| 3.4 | Detalle de cliente en la misma tabla (fila expandible o panel lateral) | Alta | — | Pendiente |
| 3.5 | Edición de cliente (`update` filtrado por `user_id`) | Media | — | Pendiente |
| 3.6 | `clientes.html`: tabla + buscador con debounce 250 ms | Alta | — | Pendiente |
| 3.7 | `clientes.html`: formulario de registro con vista previa en vivo | Alta | — | Pendiente |
| 3.8 | Detalle del cliente con sus préstamos (cuando exista `loans.js`) | Media | — | Pendiente |
| 3.9 | Mensajes de error por campo obligatorio + toast de éxito/error | Alta | — | Pendiente |

---

## Fase 4: Préstamos

| # | Tarea | Prioridad | Asignado | Estado |
|---|-------|-----------|----------|--------|
| 4.1 | Tabla `loans` creada desde `sql/schema.sql` | Alta | — | Pendiente |
| 4.2 | Módulo `js/loans.js`: `listLoans(filtros)` con propiedad vía join a `clients` | Alta | — | Pendiente |
| 4.3 | Módulo `js/loans.js`: `createLoan()` (client_id, amount, fechas, estado inicial) | Alta | — | Pendiente |
| 4.4 | Página `prestamo.html`: detalle por `?id=` (datos + lista de pagos) | Alta | — | Pendiente |
| 4.5 | Edición de préstamo (monto, tasa, fechas) | Media | — | Pendiente |
| 4.6 | Cancelación de préstamo (estado `canceled`) | Media | — | Pendiente |
| 4.7 | Página `prestamos.html`: lista con filtros ALL / ACTIVE / PENDING / OVERDUE | Alta | — | Pendiente |
| 4.8 | Formulario de nuevo préstamo con selector de cliente | Alta | — | Pendiente |
| 4.9 | Detalle con línea de tiempo de pagos (lista ordenada por fecha) | Alta | — | Pendiente |
| 4.10 | Cálculo de `overdue` en JS (maturity_date pasada y estado != paid/canceled) | Media | — | Pendiente |

---

## Fase 5: Pagos

| # | Tarea | Prioridad | Asignado | Estado |
|---|-------|-----------|----------|--------|
| 5.1 | Tabla `payments` creada desde `sql/schema.sql` | Alta | — | Pendiente |
| 5.2 | Módulo `js/payments.js`: `recordPayment(loan_id, amount)` | Alta | — | Pendiente |
| 5.3 | Módulo `js/payments.js`: `listPayments(loan_id)` ordenados por fecha | Alta | — | Pendiente |
| 5.4 | Línea de tiempo de pagos en `prestamo.html` (lista HTML, sin componentes) | Alta | — | Pendiente |
| 5.5 | Botón "Registrar pago" en detalle de préstamo (formulario simple) | Alta | — | Pendiente |
| 5.6 | Actualizar estado del préstamo a `paid` cuando la suma de pagos cubre el monto | Alta | — | Pendiente |

---

## Fase 6: Búsqueda

| # | Tarea | Prioridad | Asignado | Estado |
|---|-------|-----------|----------|--------|
| 6.1 | Búsqueda de clientes por texto con `.or(full_name, phone, gov_id)` (ya en `clients.js`) | Alta | — | Pendiente |
| 6.2 | Búsqueda de préstamos por cliente + filtros de estado y fechas | Media | — | Pendiente |
| 6.3 | Página `busqueda.html`: barra + pills ALL / ACTIVE / PENDING / OVERDUE | Alta | — | Pendiente |
| 6.4 | Filtros avanzados expandibles (fechas, montos) con `<details>` | Media | — | Pendiente |
| 6.5 | Chips de filtros activos con botón de remover (JS vanilla) | Media | — | Pendiente |
| 6.6 | Estado vacío ("Sin resultados") cuando la lista vuelve vacía | Media | — | Pendiente |
| 6.7 | Estado de carga ("Cargando…") durante cada consulta | Baja | — | Pendiente |

---

## Fase 7: Panel

| # | Tarea | Prioridad | Asignado | Estado |
|---|-------|-----------|----------|--------|
| 7.1 | Consultas de conteo (`count: exact, head: true`) para clientes y préstamos por estado | Media | — | Pendiente |
| 7.2 | Tarjetas de estadísticas en `dashboard.html` (clientes, activos, monto) | Media | — | Pendiente |
| 7.3 | Actividad reciente (últimos clientes/préstamos ordenados por `created_at`) | Media | — | Pendiente |
| 7.4 | Panel con métricas + tabla de actividad | Media | — | Pendiente |
| 7.5 | Saludo personalizado con nombre del usuario | Baja | — | Pendiente |

---

## Fase 8: UI/UX y pulido

| # | Tarea | Prioridad | Asignado | Estado |
|---|-------|-----------|----------|--------|
| 8.1 | Tema claro fijo lustre/obsidiana (modo oscuro: solo fase posterior) | Media | — | Pendiente |
| 8.2 | Estados `:hover/:focus-visible/:active/disabled` en botones e inputs (ya base en `styles.css`) | Alta | — | Pendiente |
| 8.3 | `toast(msg, type)` de éxito/error en cada acción (ya en `utils.js`) | Media | — | Pendiente |
| 8.4 | Empty states en cada lista ("Sin clientes…", "Sin resultados…") | Baja | — | Pendiente |
| 8.5 | Responsive completo (ver media query en `styles.css`) | Media | — | Pendiente |
| 8.6 | Tipografía del sistema + Georgia para marca (sin dependencias web) | Alta | — | Pendiente |

---

## Fase 9: Pruebas y despliegue

| # | Tarea | Prioridad | Asignado | Estado |
|---|-------|-----------|----------|--------|
| 9.1 | Probar flujo completo: registro → préstamo → pago → búsqueda | Alta | — | Pendiente |
| 9.2 | Probar en Chrome, Firefox y Edge | Media | — | Pendiente |
| 9.3 | Probar responsive (móvil, tablet, escritorio) | Media | — | Pendiente |
| 9.4 | Verificar despliegue estático en Vercel o GitHub Pages | Alta | — | Pendiente |
| 9.5 | Dominio personalizado (opcional) | Baja | — | Pendiente |

---

## Resumen por persona (10 estudiantes, sin React/TS)

| Persona | Rol sugerido | Tareas |
|---------|--------------|--------|
| 1 | Auth + guardia | Fase 1 |
| 2 | Layout + panel | Fases 2 y 7 |
| 3 | Clientes JS | Fase 3 (módulo) |
| 4 | Clientes HTML | Fase 3 (página) |
| 5 | Préstamos JS | Fase 4 (módulo) |
| 6 | Préstamos HTML | Fase 4 (páginas) |
| 7 | Pagos | Fase 5 |
| 8 | Búsqueda | Fase 6 |
| 9 | UI/UX + pulido | Fase 8 |
| 10 | QA + despliegue | Fase 9 (+ Fase 0.8) |

---

## Cronograma estimado

| Semana | Fase | Objetivo |
|--------|------|----------|
| 1 | Fase 0 + 1 | Starter configurado, login operativo |
| 2 | Fase 2 + 3 | Navegación y gestión de clientes |
| 3 | Fase 4 + 5 | Préstamos y pagos |
| 4 | Fase 6 + 7 | Búsqueda y panel |
| 5 | Fase 8 + 9 | Pulido, pruebas y despliegue final |

---

*Derivado de `TAREAS.md` original (Next.js). Este archivo es el válido para el starter vanilla; no modifica el original.*
