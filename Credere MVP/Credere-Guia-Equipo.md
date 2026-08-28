# Credere — Guía del Equipo

> **Versión:** 1.0 — Agosto 2026
> **Objetivo:** Que todo el equipo entienda qué vamos a construir, por qué usamos estas tecnologías y qué nos toca en cada fase.
> **Repositorio:** ()

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
| Sin estados visibles | No sabés quién pagó y quién debe |
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

### Frontend: Next.js 14

**¿Qué es?** Un framework de React para crear aplicaciones web.

**¿Por qué lo usamos?**
- Un solo lenguaje (TypeScript) para frontend y backend
- Tiene "API Routes" — no necesitamos servidor separado
- Se deploya gratis en Vercel con un push a GitHub
- Server Components = mejor rendimiento

**¿Por qué NO otras opciones?**

| Alternativa | Por qué no |
|-------------|-----------|
| React puro | Hay que configurar Webpack, Babel, servidor de APIs por separado |
| Vue | Ecosistema más chico, menos tutoriales en español |
| Angular | Demasiado pesado para un MVP, curva de aprendizaje alta |
| HTML/CSS/JS puro | No escala, no hay componentes reutilizables |

---

### Base de datos: Supabase (PostgreSQL)

**¿Qué es?** Una plataforma que nos da base de datos PostgreSQL, autenticación y almacenamiento — todo gratis.

**¿Por qué la usamos?**
- PostgreSQL es la base de datos más confiable del mundo
- Auth incluido — no hay que codear login desde cero
- Dashboard web para ver los datos sin herramientas extra
- 500MB gratis alcanza para todo el MVP

**¿Por qué NO otras opciones?**

| Alternativa | Por qué no |
|-------------|-----------|
| Firebase Firestore | NoSQL — las relaciones cliente→préstamos→pagos son complicadas |
| MySQL en Railway | Hay que configurar servidor por separado, más trabajo |
| MongoDB | NoSQL — mismo problema que Firebase |
| SQLite | No funciona bien en la nube, un solo usuario a la vez |

---

### Deploy: Vercel

**¿Qué es?** Una plataforma que toma tu código de GitHub y lo publica como sitio web.

**¿Por qué la usamos?**
- Git push = deploy automático
- Cada branch tiene su propia URL para probar
- SSL (HTTPS) incluido sin configurar
- Gratis para proyectos personales/académicos

---

### Autenticación: Supabase Auth

**¿Qué es?** Sistema de login y registro incluido en Supabase.

**¿Por qué lo usamos?**
- No hay que codear registro, login, sesiones, recuperación de contraseña
- Soporta email/password, Google, GitHub
- Row Level Security — cada usuario solo ve sus datos
- Gratis hasta 50,000 usuarios activos/mes

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

---

## 6. Qué va en el MVP y qué no

### ✅ MVP (lo que construimos ahora)

| Pantalla | Funcionalidad | Prioridad |
|----------|---------------|-----------|
| Registro de cliente | Formulario con validación y vista previa | Alta |
| Lista de clientes | Ver, buscar, filtrar clientes | Alta |
| Detalle de préstamo | Ver estado, línea de tiempo de pagos | Alta |
| Registro de pago | Marcar cuotas como pagadas | Alta |
| Búsqueda | Buscar por nombre, ID, teléfono | Alta |
| Login/Registro | Autenticación básica | Alta |

### ❌ Fase posterior (después del MVP)

| Funcionalidad | Por qué no va en MVP |
|---------------|---------------------|
| Dashboard con métricas | Nice-to-have, no esencial para empezar |
| Multiidioma | Se puede agregar después, el equipo habla español |
| Modo oscuro | Cosmético, no funcional |
| Reportes y exportación | Los usuarios pueden copiar datos a mano al inicio |
| Notificaciones push | Complejidad innecesaria para validar la idea |
| App móvil | Responsive web alcanza para MVP |

### 📋 Regla para decidir

> **Si el usuario puede hacer la tarea core sin esa función, no va en el MVP.**

La tarea core es: registrar cliente → crear préstamo → registrar pago → buscar.

---

## 7. Cómo trabajar en el proyecto

### Requisitos previos

1. Instalar Node.js (versión 18 o superior)
2. Crear cuenta en GitHub
3. Crear cuenta en Supabase (gratis)
4. Crear cuenta en Vercel (gratis, con GitHub)
5. Instalar un editor de código (VS Code recomendado)

### Primeros pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/credere.git
cd credere

# 2. Instalar dependencias
npm install

# 3. Copiar variables de entorno
cp .env.example .env.local

# 4. Agregar tus credenciales de Supabase en .env.local

# 5. Correr el proyecto
npm run dev
```

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

4. Después de merge, el código se deploya automáticamente

---

## 8. Convenciones

### Nomenclatura de archivos

```
components/
  ui/
    button.tsx        ← componente genérico
    input.tsx
  clients/
    client-form.tsx   ← componente específico de clientes
    client-list.tsx
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

- Usar **Tailwind CSS** (viene con Next.js)
- No crear archivos CSS separados除非 es necesario
- Colores del proyecto definidos en `tailwind.config.ts`:

```ts
colors: {
  lustre: '#FEFFEF',    // fondo claro
  obsidian: '#121212',  // oscuro
  accent: '#B8860B',    // dorado
}
```

---

## 9. Roles y responsabilidades

| Rol | Responsabilidad | Ejemplo |
|-----|-----------------|---------|
| Frontend | Componentes de interfaz, formularios, layouts | Crear el formulario de clientes |
| Backend | API routes, lógica de negocio, base de datos | Crear endpoint de registro |
| Fullstack | Ambos cuando la tarea lo requiere | Pantalla completa de préstamo |
| UI/UX | Diseño, wireframes, validación visual | Verificar colores y espacios |
| QA | Testing, encontrar bugs | Probar que el formulario valida bien |

### Distribución sugerida (10 personas)

- **2 Frontend** — componentes UI, formularios, layouts
- **2 Backend** — API routes, base de datos, auth
- **1 UI/UX** — consistencia visual, validación de diseño
- **1 QA** — testing, bugs, usabilidad
- **4 Fullstack** — apoyo donde se necesite

---

## 10. Preguntas frecuentes

### ¿Por qué no usamos [otra tecnología]?

Porque para un MVP necesitamos velocidad. Cada tecnología nueva agrega complejidad. Elegimos el stack que resuelve nuestro problema con menos código y menos configuración.

### ¿Cuánto tarda el MVP?

Depende del ritmo del equipo, pero estimamos **2-3 semanas** de desarrollo si trabajamos organizados.

### ¿El MVP se puede deployar gratis?

Sí. Vercel + Supabase tienen free tier suficiente para MVP.

### ¿Cómo probamos que funciona?

Cada funcionalidad se prueba antes de hacer merge:
1. El desarrollador prueba en local
2. Abre PR y pide review
3. Un compañero revisa y prueba
4. Si está bien, se hace merge

### ¿Qué pasa si hay un bug en producción?

1. Se crea un issue en GitHub con.steps para reproducir
2. Se crea una branch `fix/nombre-del-bug`
3. Se arregla, se prueba, se crea PR
4. Se hace merge y se deploya automáticamente

### ¿Dónde guardamos la documentación?

- Este archivo vive en la raíz del repositorio
- Los PRs describen los cambios
- Los issues registran bugs y tareas pendientes

---

## Enlaces útiles

| Recurso | URL |
|---------|-----|
| Repositorio | (agregar link de GitHub) |
| Deploy (producción) | (agregar link de Vercel) |
| Supabase Dashboard | (agregar link de Supabase) |
| Documentación Next.js | https://nextjs.org/docs |
| Documentación Supabase | https://supabase.com/docs |
| Tailwind CSS | https://tailwindcss.com/docs |

---

## Checklist para nuevos miembros

- [ ] Leer este documento completo
- [ ] Crear cuentas en GitHub, Supabase, Vercel
- [ ] Instalar Node.js y VS Code
- [ ] Clonar el repositorio
- [ ] Correr el proyecto en local (`npm run dev`)
- [ ] Hacer un commit de prueba y crear PR
- [ ] Presentarse en el canal del equipo

---

*Última actualización: Agosto 2026*
*Documentación viva — actualizar cuando cambien decisiones técnicas*
