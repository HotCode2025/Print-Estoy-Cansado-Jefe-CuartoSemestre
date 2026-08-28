# Credere — Tareas del MVP

> **Instrucciones:** Cada persona se asigna una tarea, pone su nombre en "Asignado" y mueve el estado cuando avance.
>
> **Estados:** `Pendiente` → `En progreso` → `En review` → `Completado`

---

## Fase 0: Configuración del proyecto

| # | Tarea | Prioridad | Asignado | Estado |
|---|-------|-----------|----------|--------|
| 0.1 | Crear repositorio en GitHub | Alta | — | Pendiente |
| 0.2 | Configurar Next.js + TypeScript en el repo | Alta | — | Pendiente |
| 0.3 | Crear cuenta en Supabase y conectar a Next.js | Alta | — | Pendiente |
| 0.4 | Configurar Tailwind CSS con la paleta de colores del proyecto | Alta | — | Pendiente |
| 0.5 | Crear variables de entorno (.env.example) | Alta | — | Pendiente |
| 0.6 | Deploy inicial en Vercel (verificar que funcione) | Media | — | Pendiente |

---

## Fase 1: Autenticación

| # | Tarea | Prioridad | Asignado | Estado |
|---|-------|-----------|----------|--------|
| 1.1 | Configurar Supabase Auth (email/password) | Alta | — | Pendiente |
| 1.2 | Crear pantalla de Login | Alta | — | Pendiente |
| 1.3 | Crear pantalla de Registro | Alta | — | Pendiente |
| 1.4 | Middleware de protección de rutas (solo usuarios logueados) | Alta | — | Pendiente |
| 1.5 | Cerrar sesión (logout) | Alta | — | Pendiente |

---

## Fase 2: Layout y navegación

| # | Tarea | Prioridad | Asignado | Estado |
|---|-------|-----------|----------|--------|
| 2.1 | Crear componente Sidebar (colapsable) | Alta | — | Pendiente |
| 2.2 | Crear componente TopBar (saludo + fecha) | Alta | — | Pendiente |
| 2.3 | Layout principal (sidebar + contenido) | Alta | — | Pendiente |
| 2.4 | Navegación entre pantallas (links del sidebar) | Alta | — | Pendiente |
| 2.5 | Estado activo del sidebar (borde dorado) | Media | — | Pendiente |
| 2.6 | Sidebar responsive (bottom tabs en móvil) | Media | — | Pendiente |

---

## Fase 3: Clientes

| # | Tarea | Prioridad | Asignado | Estado |
|---|-------|-----------|----------|--------|
| 3.1 | Crear tabla de clientes en Supabase | Alta | — | Pendiente |
| 3.2 | API route: obtener lista de clientes | Alta | — | Pendiente |
| 3.3 | API route: crear cliente | Alta | — | Pendiente |
| 3.4 | API route: obtener cliente por ID | Alta | — | Pendiente |
| 3.5 | API route: editar cliente | Media | — | Pendiente |
| 3.6 | Pantalla: lista de clientes con búsqueda | Alta | — | Pendiente |
| 3.7 | Pantalla: formulario de registro (con vista previa) | Alta | — | Pendiente |
| 3.8 | Pantalla: detalle del cliente | Media | — | Pendiente |
| 3.9 | Validación de formulario (campos obligatorios) | Alta | — | Pendiente |

---

## Fase 4: Préstamos

| # | Tarea | Prioridad | Asignado | Estado |
|---|-------|-----------|----------|--------|
| 4.1 | Crear tabla de préstamos en Supabase | Alta | — | Pendiente |
| 4.2 | API route: obtener préstamos (con filtros) | Alta | — | Pendiente |
| 4.3 | API route: crear préstamo | Alta | — | Pendiente |
| 4.4 | API route: obtener préstamo por ID | Alta | — | Pendiente |
| 4.5 | API route: editar préstamo | Media | — | Pendiente |
| 4.6 | API route: cancelar préstamo | Media | — | Pendiente |
| 4.7 | Pantalla: lista de préstamos con filtros (ALL/ACTIVE/PENDING/OVERDUE) | Alta | — | Pendiente |
| 4.8 | Pantalla: formulario de nuevo préstamo | Alta | — | Pendiente |
| 4.9 | Pantalla: detalle del préstamo (datos + timeline) | Alta | — | Pendiente |
| 4.10 | Lógica de estados (calcular overdue automáticamente) | Media | — | Pendiente |

---

## Fase 5: Pagos

| # | Tarea | Prioridad | Asignado | Estado |
|---|-------|-----------|----------|--------|
| 5.1 | Crear tabla de pagos en Supabase | Alta | — | Pendiente |
| 5.2 | API route: registrar pago | Alta | — | Pendiente |
| 5.3 | API route: obtener pagos de un préstamo | Alta | — | Pendiente |
| 5.4 | Componente: línea de tiempo de pagos (Payment Timeline) | Alta | — | Pendiente |
| 5.5 | Botón "Record Payment" en detalle de préstamo | Alta | — | Pendiente |
| 5.6 | Actualizar estado del préstamo al registrar pago | Alta | — | Pendiente |

---

## Fase 6: Búsqueda

| # | Tarea | Prioridad | Asignado | Estado |
|---|-------|-----------|----------|--------|
| 6.1 | API route: búsqueda por texto (nombre, ID, teléfono) | Alta | — | Pendiente |
| 6.2 | API route: búsqueda con filtros avanzados | Media | — | Pendiente |
| 6.3 | Pantalla: barra de búsqueda + pills de filtro | Alta | — | Pendiente |
| 6.4 | Filtros avanzados (expandible: fechas, montos) | Media | — | Pendiente |
| 6.5 | Chips de filtros activos con botón de remover | Media | — | Pendiente |
| 6.6 | Estado vacío ("No se encontraron resultados") | Media | — | Pendiente |
| 6.7 | Estado de carga (skeleton loading) | Baja | — | Pendiente |

---

## Fase 7: Dashboard

| # | Tarea | Prioridad | Asignado | Estado |
|---|-------|-----------|----------|--------|
| 7.1 | API route: obtener métricas (total, active, pending, overdue) | Media | — | Pendiente |
| 7.2 | Componente: tarjetas de estadísticas | Media | — | Pendiente |
| 7.3 | API route: obtener actividad reciente | Media | — | Pendiente |
| 7.4 | Pantalla: dashboard con métricas + tabla de actividad | Media | — | Pendiente |
| 7.5 | Saludo personalizado con nombre del usuario | Baja | — | Pendiente |

---

## Fase 8: UI/UX y pulido

| # | Tarea | Prioridad | Asignado | Estado |
|---|-------|-----------|----------|--------|
| 8.1 | Modo oscuro/claro (toggle + persistencia) | Media | — | Pendiente |
| 8.2 | Estados hover/focus/active en botones e inputs | Alta | — | Pendiente |
| 8.3 | Notificaciones toast (éxito/error) | Media | — | Pendiente |
| 8.4 | Empty states ilustrados para cada pantalla | Baja | — | Pendiente |
| 8.5 | Responsive completo (mobile breakpoints) | Media | — | Pendiente |
| 8.6 | Tipografía: DM Serif, DM Sans, JetBrains Mono | Alta | — | Pendiente |

---

## Fase 9: Testing y deploy

| # | Tarea | Prioridad | Asignado | Estado |
|---|-------|-----------|----------|--------|
| 9.1 | Probar flujo completo: registro → préstamo → pago | Alta | — | Pendiente |
| 9.2 | Probar en diferentes navegadores (Chrome, Firefox, Safari) | Media | — | Pendiente |
| 9.3 | Probar responsive (mobile, tablet, desktop) | Media | — | Pendiente |
| 9.4 | Verificar deploy en Vercel funciona correctamente | Alta | — | Pendiente |
| 9.5 | Configurar dominio personalizado (opcional) | Baja | — | Pendiente |

---

## Resumen por persona

| Persona | Rol sugerido | Tareas asignadas | Completadas |
|---------|--------------|------------------|-------------|
| 1 | Frontend | — | — |
| 2 | Frontend | — | — |
| 3 | Backend | — | — |
| 4 | Backend | — | — |
| 5 | UI/UX | — | — |
| 6 | QA | — | — |
| 7 | Fullstack | — | — |
| 8 | Fullstack | — | — |
| 9 | Fullstack | — | — |
| 10 | Fullstack | — | — |

---

## Cronograma estimado

| Semana | Fase | Objetivo |
|--------|------|----------|
| 1 | Fase 0 + 1 | Proyecto funcionando, login operativo |
| 2 | Fase 2 + 3 | Navegación y gestión de clientes |
| 3 | Fase 4 + 5 | Préstamos y pagos |
| 4 | Fase 6 + 7 | Búsqueda y dashboard |
| 5 | Fase 8 + 9 | Pulido, testing y deploy final |

---

*Archivo vivo — actualizar durante la reunión de planificación*
