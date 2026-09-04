# Credere — Guía del Equipo

> **Versión:** 1.1 Vanilla — Septiembre 2026 (actualiza v1.0 Agosto 2026)
> **Cambio principal:** se reemplaza Next.js + React + TypeScript por HTML5 + JavaScript Vanilla (módulos ES) + Tailwind por CDN, sin Node ni build. El backend profesional se mantiene: Supabase (PostgreSQL + Auth + RLS).
> **Objetivo:** Que todo el equipo entienda qué vamos a construir, por qué usamos estas tecnologías y qué nos toca en cada fase.
> **Repositorio:** ()
> **Fuentes válidas:** `TAREAS-Vanilla.md` (fases y tareas) y `Credere-MER-Completo.md` (modelo de datos).

---

# ¿Por qué elegimos Credere? 🚀

Elegimos **Credere** como el nombre de nuestra app porque conecta directamente el **origen histórico de las finanzas** con el **propósito central de nuestra plataforma**.

### 📌 Significado y Origen
* **Raíz Latina:** *Credere* es un verbo en latín que significa literalmente **"creer"** o **"confiar"**.
* **El Origen del Crédito:** De esta palabra nace el término moderno **"Crédito"**. En la antigüedad, un crédito no era solo una transacción de dinero; era un acto de fe. Prestarle a alguien significaba *creer en su palabra* y confiar en que regresaría el valor entregado.

### 🎯 ¿Por qué es el nombre perfecto para nuestra app?

1. **Ataca el problema del prestamista:** El mayor riesgo de un prestamista es la incertidumbre. **Credere** transforma la desconfianza en control, orden y seguridad a través de la tecnología.
2. **Identidad Fintech:** Es un nombre corto, con fuerza, fácil de recordar y que suena sofisticado en el ecosistema financiero actual.
3. **Doble Propósito:** Refleja la confianza mutua. El prestamista confía en su cliente, y ambos confían en nuestra aplicación para llevar las cuentas claras, exactas y sin errores.

> *"En las finanzas, todo comienza con la confianza. Credere es la herramienta que la respalda."*

---

## Tabla de contenidos

1. [Qué es Credere](#1-qu%C3%A9-es-credere)
2. [El problema que resolvemos](#2-el-problema-que-resolvemos)
3. [Nuestra solución](#3-nuestra-soluci%C3%B3n)
4. [Stack tecnológico y por qué](#4-stack-tecnol%C3%B3gico-y-por-qu%C3%A9)
5. [Base de datos](#5-base-de-datos)
6. [Qué va en el MVP y qué no](#6-qu%C3%A9-va-en-el-mvp-y-qu%C3%A9-no)
7. [Cómo trabajar en el proyecto](#7-c%C3%B3mo-trabajar-en-el-proyecto)
8. [Convenciones](#8-convenciones)
9. [Roles y responsabilidades](#9-roles-y-responsabilidades)
10. [Preguntas frecuentes](#10-preguntas-frecuentes)

---

## 1. Qué es Credere

Credere es una **aplicación web** para que personas que prestan dinero puedan registrar clientes, controlar préstamos y hacer seguimiento de pagos.

**En una frase:** Es el cuaderno del prestamista, pero digital, seguro y accesible desde cualquier dispositivo.

**Usuarios objetivo:**
- Prestamistas particulares
- Comerciantes con ventas fiadas
- Pequeñas financieras
- Emprendedores que dan créditos

---

## 2. El problema que resolvemos

| Problema actual | Consecuencia |
|-----------------|--------------|
| Registros en cuadernos | Se pierde información, no hay respaldo |
| Hojas de cálculo | Desorden, difícil de buscar, errores de fórmula |
| WhatsApp | Datos mezclados con conversaciones, imposible reportar |
| Sin estados visibles | No se sabe quién pagó y quién debe |
| Sin búsqueda rápida | Encontrar un cliente toma minutos |

**Credere resuelve:** Centralizar todo en un solo lugar, con búsqueda instantánea, estados visuales y control de acceso.

---

## 3. Nuestra solución

### Pantallas principales

```
┌─────────────┬──────────────────────────────────┐
│             │                                  │
│  SIDEBAR    │  CONTENIDO                       │
│             │                                  │
│  Dashboard  │  ┌─────────────────────────────┐ │
│  Clients    │  │  Pantalla activa            │ │
│  Loans      │  │                             │ │
│  Search     │  │  (Dashboard, Clientes,      │ │
│  Reports    │  │   Préstamos, Búsqueda)      │ │
│  Settings   │  │                             │ │
│             │  └─────────────────────────────┘ │
│             │                                  │
└─────────────┴──────────────────────────────────┘
```

### Flujo básico de usuario

1. **Entra** → ve el Dashboard con métricas
2. **Registra un cliente** → formulario con vista previa
3. **Crea un préstamo** → asocia monto, tasa, fechas
4. **Registra pagos** → la línea de tiempo se actualiza
5. **Busca** → encuentra cualquier préstamo en segundos

---

## 4. Stack tecnológico y por qué

> **Decisión (v1.1):** Frontend en HTML5 + JavaScript Vanilla (módulos ES) + Tailwind por CDN. Sin React, sin TypeScript, sin Next.js, sin Node ni build. El backend sigue siendo profesional: Supabase (PostgreSQL + Auth + Row Level Security).

### Frontend: HTML5 + JavaScript Vanilla (módulos ES) + Tailwind por CDN

**¿Qué es?** Páginas HTML estáticas que cargan Tailwind desde CDN y lógica en archivos `js/*.js` con `import`/`export` nativos del navegador. La librería `supabase-js` se usa directamente desde cada módulo.

**¿Por qué lo usamos?**
- Arranque inmediato: son 10 personas sin experiencia previa en React; no hay curva de aprendizaje ni instalación.
- Sin herramientas: no se requiere Node, npm, compilación ni configuración de bundler.
- Suficiente para el MVP: formularios, tablas, filtros y línea de tiempo se resuelven con funciones de render en cada módulo.
- Sigue siendo serio: la parte profesional vive en el backend (PostgreSQL + RLS + Auth de Supabase); el frontend solo consume datos con reglas de seguridad aplicadas en la base.

**¿Por qué NO otras opciones?**

| Alternativa | Por qué no |
|-------------|-----------|
| Next.js / React + TypeScript | Curva de aprendizaje alta para el equipo actual; exige Node, build y deploy con compilación. Se puede migrar después sin cambiar la base de datos. |
| Vue | Ecosistema más chico, menos tutoriales en español; agrega同样 una capa de framework que el equipo no necesita ahora. |
| Angular | Demasiado pesado para un MVP, curva de aprendizaje alta. |
| Vanilla sin disciplina | Sí escala si se respeta una sola inicialización (`js/supabaseClient.js`), un módulo por dominio (`clients.js`, `loans.js`, `payments.js`) y políticas RLS en la base. El riesgo no es la tecnología, es duplicar clientes o saltarse el guardia de sesión. |

**Reglas Vanilla obligatorias:**
1. Un único punto de inicialización: `js/supabaseClient.js` (prohibido crear otro cliente en otro archivo).
2. Un módulo por dominio: `js/auth.js`, `js/clients.js`, `js/loans.js`, `js/payments.js`, `js/utils.js` (guardia de sesión, toast, debounce).
3. Cada página protegida llama a `requireSessionOrRedirect()` al cargar.

---

### Base de datos: Supabase (PostgreSQL)

**¿Qué es?** Una plataforma que nos da base de datos PostgreSQL, autenticación y almacenamiento — todo gratis.

**¿Por qué la usamos?**
- PostgreSQL es la base de datos más confiable del mundo
- Auth incluido — no hay que programar login desde cero
- Dashboard web para ver los datos sin herramientas extra
- 500MB gratis alcanza para todo el MVP
- Row Level Security (RLS): cada usuario solo ve sus datos aunque el frontend sea estático

**¿Por qué NO otras opciones?**

| Alternativa | Por qué no |
|-------------|-----------|
| Firebase Firestore | NoSQL — las relaciones cliente→préstamos→pagos son complicadas |
| MySQL en Railway | Hay que configurar servidor por separado, más trabajo |
| MongoDB | NoSQL — mismo problema que Firebase |
| SQLite | No funciona bien en la nube, un solo usuario a la vez |

El esquema canónico vive en `sql/schema.sql` y el modelo completo en `Credere-MER-Completo.md`. Se ejecuta desde el SQL Editor de Supabase y luego se verifica que RLS esté activado.

---

### Deploy: sitio estático (Vercel sin build o GitHub Pages)

**¿Qué es?** Publicar las carpetas HTML/CSS/JS tal cual, sin compilar.

**¿Por qué lo usamos?**
- No hay paso de build: el push a GitHub publica directamente
- Cada branch puede tener su propia URL de vista previa
- SSL (HTTPS) incluido sin configurar
- Gratis para proyectos personales/académicos

**Notas:**
- En Vercel se configura como proyecto estático (sin comando de build, sin `npm run dev`).
- Alternativa válida: GitHub Pages con la misma estructura de archivos.

---

### Autenticación: Supabase Auth con `supabase-js` + guardia de sesión

**¿Qué es?** Sistema de login y registro incluido en Supabase, consumido desde el navegador con la librería `supabase-js` v2.

**¿Por qué lo usamos?**
- No hay que programar registro, login, sesiones ni recuperación de contraseña
- Soporta email/password, Google, GitHub
- Row Level Security — cada usuario solo ve sus datos
- Gratis hasta 50,000 usuarios activos/mes

**Patrón en Vanilla:**
- `login.html` y `register.html` usan `supabase.auth.signInWithPassword()` / `signUp()`.
- Cada página protegida importa `requireSessionOrRedirect()` desde `js/utils.js`; si no hay sesión, redirige a `login.html`.
- Cerrar sesión: `supabase.auth.signOut()` + redirección a `login.html`.
- Nunca exponer la clave `service_role` en el frontend; solo `SUPABASE_URL` + `SUPABASE_ANON_KEY` en `js/config.js`.

---

## 5. Base de datos

### Modelo de datos (simplificado)

```
CLIENTE ──< PRÉSTAMO ──< PAGO
   1           N           N
```

- Un cliente tiene muchos préstamos
- Un préstamo tiene muchos pagos

### Tablas

```sql
-- Clients: información del cliente
clients (
  id, full_name, phone, email, gov_id, address, notes, created_at
)

-- Loans: cada préstamo asignado a un cliente
loans (
  id, client_id, amount, interest_rate, status,
  origination_date, maturity_date, created_at
)

-- Payments: cada pago registrado para un préstamo
payments (
  id, loan_id, amount, payment_date, created_at
)
```

### Estados de un préstamo

| Estado | Color | Significado |
|--------|-------|-------------|
| `pending` | Ámbar | Esperando aprobación |
| `active` | Verde | En curso, pagando |
| `overdue` | Rojo | Vencido, atrasado |
| `paid` | Verde claro | Completado |
| `canceled` | Gris | Cancelado |

> Detalle completo de entidades, atributos, relaciones y SQL en `Credere-MER-Completo.md`. El archivo ejecutable es `sql/schema.sql`.

---

## 6. Qué va en el MVP y qué no

### ✅ MVP (lo que construimos ahora)

| Pantalla | Funcionalidad | Prioridad | Fase Vanilla |
|----------|---------------|-----------|--------------|
| Registro de cliente | Formulario con validación y vista previa | Alta | Fase 3 |
| Lista de clientes | Ver, buscar, filtrar clientes | Alta | Fase 3 |
| Detalle de préstamo | Ver estado, línea de tiempo de pagos | Alta | Fase 4 |
| Registro de pago | Marcar cuotas como pagadas | Alta | Fase 5 |
| Búsqueda | Buscar por nombre, ID, teléfono | Alta | Fase 6 |
| Login/Registro | Autenticación básica | Alta | Fase 1 |
| Layout y navegación | Sidebar + encabezado común | Alta | Fase 2 |

### ⚠️ Fase 7 opcional (prioridad media, no bloquea el MVP)

| Funcionalidad | Alcance | Prioridad |
|---------------|---------|-----------|
| Dashboard con métricas (`dashboard.html`) | Tarjetas de estadísticas + actividad reciente con conteos | Media |

> **Conciliación con `TAREAS-Vanilla.md`:** la guía v1.0 ubicaba el dashboard como post-MVP y `TAREAS-Vanilla.md` lo define como Fase 7 de prioridad media. Criterio vigente: el dashboard **no es core**; se construye solo si el flujo registro → préstamo → pago → búsqueda ya funciona (Fases 1–6). No bloquea la entrega del MVP.

### ❌ Fase posterior (después del MVP)

| Funcionalidad | Por qué no va en MVP |
|---------------|---------------------|
| Multiidioma | Se puede agregar después, el equipo habla español |
| Modo oscuro | Cosmético, no funcional (tema claro fijo lustre/obsidiana) |
| Reportes y exportación | Los usuarios pueden copiar datos a mano al inicio |
| Notificaciones push | Complejidad innecesaria para validar la idea |
| App móvil | Responsive web alcanza para MVP |

### 📋 Regla para decidir

> **Si el usuario puede hacer la tarea core sin esa función, no va en el MVP.**

La tarea core es: registrar cliente → crear préstamo → registrar pago → buscar.

---

## 7. Cómo trabajar en el proyecto

### Requisitos previos (sin Node)

1. Navegador moderno (Chrome, Firefox o Edge actualizado)
2. VS Code con la extensión Live Server (o equivalente para servir archivos estáticos)
3. Cuenta en GitHub
4. Cuenta en Supabase (gratis)
5. Cuenta en Vercel (gratis, con GitHub) o GitHub Pages para el deploy estático

No se requiere instalar Node.js ni npm.

### Primeros pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/credere.git
cd credere

# 2. Copiar la base del starter vanilla (no instalar nada)
# Copiar la carpeta credere-vanilla-starter/ como punto de partida

# 3. Configurar credenciales de Supabase en js/config.js
# Editar js/config.js con SUPABASE_URL y SUPABASE_ANON_KEY del panel de Supabase
# Nunca usar la clave service_role en el frontend

# 4. Crear las tablas: ejecutar sql/schema.sql en Supabase SQL Editor
# Verificar que Row Level Security (RLS) quedó activado

# 5. Servir en local con Live Server (botón "Go Live" en VS Code)
# No abrir con file:// — los módulos ES y las llamadas a Supabase requieren http://localhost
```

Verificación rápida: abrir `login.html`, registrar un usuario, iniciar sesión y dar de alta un cliente.

### Flujo de trabajo (Git Flow simplificado)

```
main          ← código funcionando, listo para deploy
  └── develop ← código integrado, en desarrollo
       └── feature/nombre  ← una tarea específica
```

**Pasos para trabajar:**

1. Crear branch desde `develop`:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/registro-clientes
   ```

2. Hacer cambios y commitear:
   ```bash
   git add .
   git commit -m "feat: agregar formulario de registro"
   ```

3. Push y crear Pull Request:
   ```bash
   git push origin feature/registro-clientes
   ```
   - Ir a GitHub → crear PR hacia `develop`
   - Pedir review a un compañero
   - Verificar en la preview estática que el flujo afectado funciona

4. Después de merge, el código se deploya automáticamente como sitio estático

---

## 8. Convenciones

### Estructura Vanilla del proyecto

```
index.html            ← redirección o landing (redirige a login.html o dashboard.html)
login.html            ← inicio de sesión
register.html         ← registro de usuario
dashboard.html        ← panel Fase 7 (opcional)
clientes.html         ← tabla + buscador + formulario de clientes
prestamos.html        ← lista de préstamos con filtros
prestamo.html?id=... ← detalle de préstamo + línea de tiempo de pagos
busqueda.html         ← búsqueda global
js/
  config.js           ← SUPABASE_URL + SUPABASE_ANON_KEY (único lugar con claves)
  supabaseClient.js   ← ÚNICA inicialización del cliente Supabase
  auth.js             ← login, registro, logout
  utils.js            ← requireSessionOrRedirect(), toast(), debounce()
  clients.js          ← listClients(), createClient(), updateClient()
  loans.js            ← listLoans(), createLoan(), cálculo de overdue
  payments.js         ← recordPayment(), listPayments()
  dashboard.js        ← conteos y actividad reciente (Fase 7)
css/
  styles.css          ← estilos propios + nav-active + responsive
sql/
  schema.sql          ← esquema canónico (fuente ejecutable)
```

Ejemplo de patrón por módulo (`js/clients.js` — mismo patrón para `loans.js` y `payments.js`):

```js
import { supabase } from './supabaseClient.js';

export async function listClients(search = '') {
  let query = supabase.from('clients').select('*').order('created_at', { ascending: false });
  if (search) query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,gov_id.ilike.%${search}%`);
  return query;
}

export async function createClient(data) {
  return supabase.from('clients').insert(data).select().single();
}
```

Guardia de sesión (`js/utils.js`, uso en cada página protegida):

```js
import { supabase } from './supabaseClient.js';

export async function requireSessionOrRedirect() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) window.location.href = 'login.html';
}
```

### Nomenclatura de commits

```
feat:      nueva funcionalidad
fix:       corrección de bug
refactor:  reorganizar código sin cambiar funcionalidad
docs:      documentación
style:     cambios de estilo (CSS, tipografía)
test:      agregar o modificar tests
```

**Ejemplo:**
```
feat: agregar formulario de registro de clientes
fix: corregir búsqueda que no filtraba por estado
docs: actualizar guía del equipo
```

### Nomenclatura de ramas

```
feature/nombre-descriptivo
fix/nombre-del-bug
refactor/nombre-del-cambio
```

**Ejemplo:**
```
feature/registro-clientes
feature/busqueda-avanzada
fix/fechas-no-se-guardaban
```

### Estilos CSS

- **Tailwind por CDN** en cada página:
  ```html
  <script src="https://cdn.tailwindcss.com"></script>
  ```
- Estilos propios mínimos en `css/styles.css` (estados `:hover`, `:focus-visible`, responsive).
- Colores del proyecto (vía configuración inline del CDN o clases propias, no hay `tailwind.config.ts`):

```js
tailwind.config = {
  theme: {
    extend: {
      colors: {
        lustre: '#FEFFEF',    // fondo claro
        obsidian: '#121212',  // oscuro
        accent: '#B8860B',    // dorado
      }
    }
  }
}
```

---

## 9. Roles y responsabilidades

| Rol | Responsabilidad | Ejemplo |
|-----|-----------------|---------|
| Frontend | Páginas HTML, formularios, tablas, layouts | Crear `clientes.html` con buscador |
| Backend | SQL, lógica de datos, base de datos, RLS | Ajustar `sql/schema.sql` y políticas |
| Fullstack | Módulo JS + página cuando la tarea lo requiere | `loans.js` + `prestamos.html` |
| UI/UX | Diseño, wireframes, validación visual | Verificar colores y espacios |
| QA | Testing, encontrar bugs | Probar que el formulario valida bien |

### Distribución sugerida (10 personas, rebanadas verticales)

Para evitar colisiones en Vanilla (sin componentes), cada dúo es dueño de su módulo JS + sus páginas:

- **Dúo Clientes** (2) — `js/clients.js` + `clientes.html` (Fase 3)
- **Dúo Préstamos/Pagos** (2) — `js/loans.js` + `js/payments.js` + `prestamos.html` + `prestamo.html` (Fases 4–5)
- **Auth + Búsqueda** (2) — `js/auth.js`, guardia de sesión + `login.html`, `register.html`, `busqueda.html` (Fases 1 y 6)
- **Layout + Panel** (1) — sidebar, encabezado + `dashboard.html` Fase 7 opcional (Fases 2 y 7)
- **UI + Base de datos + QA** (2) — `css/styles.css`, `sql/schema.sql`, RLS, pulido y pruebas (Fases 0, 8, 9)
- **Coordinación + QA final** (1) — integración, flujo registro → login → alta cliente, deploy estático

Detalle de tareas por persona en `TAREAS-Vanilla.md` (sección Resumen por persona).

---

## 10. Preguntas frecuentes

### ¿Por qué no usamos [otra tecnología]?

Porque para un MVP con 10 personas sin experiencia en React necesitamos velocidad de arranque. Vanilla elimina instalación, build y curva de aprendizaje, y cubre todo el flujo core con módulos simples. La seriedad del sistema no depende del framework del frontend: vive en PostgreSQL + RLS + Auth de Supabase, que se mantienen intactos. Si el producto valida, se puede migrar el frontend a un framework sin tocar la base de datos.

### ¿Cuánto tarda el MVP?

Depende del ritmo del equipo, pero estimamos **4–5 semanas** siguiendo las Fases 0–9 de `TAREAS-Vanilla.md` (semana 1: starter + login; semanas 2–3: clientes, préstamos, pagos; semana 4: búsqueda + panel opcional; semana 5: pulido y deploy).

### ¿El MVP se puede deployar gratis?

Sí. Vercel (sitio estático sin build) o GitHub Pages + Supabase tienen free tier suficiente para MVP.

### ¿Cómo probamos que funciona?

Cada funcionalidad se prueba antes de hacer merge:
1. El desarrollador prueba en local con Live Server (no con `file://`)
2. Abre PR y pide review
3. Un compañero revisa y prueba el flujo afectado
4. Si está bien, se hace merge

Flujo de verificación mínimo: registro → login → alta de cliente → crear préstamo → registrar pago → buscar.

### ¿Qué pasa si hay un bug en producción?

1. Se crea un issue en GitHub con pasos para reproducir
2. Se crea una branch `fix/nombre-del-bug`
3. Se arregla, se prueba, se crea PR
4. Se hace merge y se deploya automáticamente

### ¿Dónde guardamos la documentación?

- Este archivo vive en la raíz del repositorio
- `TAREAS-Vanilla.md` es la fuente de fases y tareas
- `Credere-MER-Completo.md` es la fuente del modelo de datos
- Los PRs describen los cambios
- Los issues registran bugs y tareas pendientes

---

## Enlaces útiles

| Recurso | URL |
|---------|-----|
| Repositorio | (agregar link de GitHub) |
| Deploy (producción) | (agregar link de Vercel o GitHub Pages) |
| Supabase Dashboard | (agregar link de Supabase) |
| MDN Web Docs (HTML/CSS/JS) | https://developer.mozilla.org/ |
| Supabase JS v2 (`supabase-js`) | https://supabase.com/docs/reference/javascript/introduction |
| Documentación Supabase | https://supabase.com/docs |
| Tailwind por CDN | https://tailwindcss.com/docs/installation/play-cdn |
| Tareas Vanilla (interno) | `TAREAS-Vanilla.md` |
| Modelo de datos (interno) | `Credere-MER-Completo.md` |

---

## Checklist para nuevos miembros

- [ ] Leer este documento completo
- [ ] Crear cuentas en GitHub, Supabase, Vercel
- [ ] Instalar VS Code + Live Server (sin Node ni npm)
- [ ] Clonar el repositorio y copiar la base del starter vanilla
- [ ] Configurar `js/config.js` con URL + anon key (nunca `service_role`)
- [ ] Ejecutar `sql/schema.sql` y verificar que RLS está activado
- [ ] Servir en local con Go Live y probar flujo registro → login → alta cliente
- [ ] Hacer un commit de prueba y crear PR
- [ ] Presentarse en el canal del equipo

---

*Última actualización: Septiembre 2026 — v1.1 Vanilla (reemplaza stack Next.js por HTML + JS Vanilla + Tailwind CDN; backend Supabase sin cambios)*
*Documentación viva — actualizar cuando cambien decisiones técnicas*
