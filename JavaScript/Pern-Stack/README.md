# PERN Stack — Clase 06: CRUD de tareas con PostgreSQL

Backend Express + PostgreSQL con CRUD de tareas. Sirve para la Clase 06 (6.1–6.6): conexión con Pool de `pg`, tabla `tareas` y endpoints con `RETURNING *` y manejo 404.

## Ruta rápida

1. Instalá dependencias con pnpm (no usar npm):
   ```bash
   pnpm install
   ```
2. Creá la base y la tabla (PostgreSQL 18 corriendo):
   ```bash
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -c "CREATE DATABASE pern_db;"
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -d pern_db -f database/init.sql
   ```
3. Exportá tu clave de Postgres (cada uno usa la suya):
   ```powershell
   $env:PGPASSWORD="tu_clave"
   ```
4. Levantá el server:
   ```bash
   pnpm dev
   ```
5. Verificá: `GET http://localhost:3000/` devuelve el mensaje de bienvenida.

## Detalles

- **Conexión:** `src/db.js` con `Pool` de `pg`, lee de `src/config.js`.
- **Tabla:** `tareas(id, titulo, descripcion, completada, creado_en)`, ver `database/init.sql`.
- **Variables:** `PGUSER` (postgres), `PGHOST` (localhost), `PGPASSWORD` (postgres), `PGDATABASE` (pern_db), `PGPORT` (5432), `PORT` (3000).
- **Scripts:** `pnpm dev` (nodemon), `pnpm start` (node).
- **Lockfile:** `pnpm-lock.yaml` es el válido. `package-lock.json` quedó legacy de npm, no instalar con npm.

### Endpoints

- **GET `/`:** mensaje de bienvenida.
- **GET `/api/tareas`:** lista ordenada por id.
- **GET `/api/tareas/:id`:** una tarea o 404.
- **POST `/api/tareas`:** crea (`titulo` requerido) o 400, devuelve 201.
- **PUT `/api/tareas/:id`:** actualiza parcial o 404.
- **DELETE `/api/tareas/:id`:** borra (204) o 404.

## Checklist

- [ ] `psql -d pern_db -c "\d tareas"` muestra la tabla
- [ ] `GET /` responde 200
- [ ] `POST /api/tareas` crea y devuelve la fila con id
- [ ] `GET /api/tareas/:id` de un id inexistente devuelve 404

## Siguiente paso

Probar el CRUD contra `pern_db` local antes del push. El push a `main` lo avisa el equipo.
