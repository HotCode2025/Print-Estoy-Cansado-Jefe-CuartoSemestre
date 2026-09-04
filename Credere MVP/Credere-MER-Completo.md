# Modelo de Entidades y Relaciones — Credere

## 1. ¿Qué es un Modelo de Entidades y Relaciones?

Un **Modelo de Entidades y Relaciones** (también llamado MER o ER por sus siglas en inglés) es una forma de representar gráficamente la estructura de una base de datos. Responde tres preguntas básicas:

1. **¿Qué entidades (cosas) existen en el sistema?**
2. **¿Qué atributos (información) tiene cada entidad?**
3. **¿Cómo se relacionan las entidades entre sí?**

### Componentes del modelo

| Componente | Qué representa | Símbolo |
|------------|----------------|---------|
| **Entidad** | Una cosa o concepto del mundo real que queremos guardar | Rectángulo |
| **Atributo** | Una propiedad o dato de esa entidad | Elipse |
| **Relación** | Cómo se conectan dos entidades entre sí | Rombo |
| **Cardinalidad** | Cuántas instancias de una entidad se conectan con otra | Flechas o números |

---

## 2. Entidades de Credere

### ¿Qué son las entidades?

Las entidades son las **cosas principales** que nuestro sistema necesita recordar. Si no existe algo, no tiene sentido que exista la base de datos.

### Entidades identificadas

| # | Entidad | ¿Qué es? | ¿Por qué existe? |
|---|---------|-----------|-------------------|
| 1 | **CLIENTE** | Persona que solicita un préstamo | Sin clientes no hay préstamos |
| 2 | **PRÉSTAMO** | Dinero que se le presta al cliente | Es la función principal del sistema |
| 3 | **PAGO** | Cada cuota que el cliente devuelve | Sin pagos no hay seguimiento |
| 4 | **USUARIO** | Persona que usa el sistema (prestamista) | Sin usuario no hay quién gestione |

### Diagrama de entidades

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ CLIENTE  │    │ PRÉSTAMO │    │   PAGO   │    │ USUARIO  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

---

## 3. Atributos de cada entidad

### 3.1 CLIENTE

| Atributo | Tipo | Descripción | ¿Obligatorio? |
|----------|------|-------------|----------------|
| id | UUID | Identificador único | Sí |
| full_name | Texto | Nombre completo | Sí |
| phone | Texto | Teléfono de contacto | Sí |
| email | Texto | Correo electrónico | No |
| gov_id | Texto | Cédula o documento de identidad | Sí (único) |
| address | Texto | Dirección del cliente | No |
| notes | Texto | Notas internas sobre el cliente | No |
| created_at | Fecha/Hora | Cuándo se registró | Sí (automático) |

**Diagrama:**

```
                    ┌──────────┐
                    │    id    │
                    ├──────────┤
                    │full_name │
        ┌───────────├──────────┤
        │           │  phone   │
   CLIENTE          ├──────────┤
        │           │  email   │
        │           ├──────────┤
        │           │  gov_id  │
        └───────────├──────────┤
                    │ address  │
                    ├──────────┤
                    │  notes   │
                    ├──────────┤
                    │created_at│
                    └──────────┘
```

### 3.2 PRÉSTAMO

| Atributo | Tipo | Descripción | ¿Obligatorio? |
|----------|------|-------------|----------------|
| id | UUID | Identificador único | Sí |
| client_id | UUID | Referencia al cliente (FK) | Sí |
| amount | Decimal | Monto del préstamo | Sí |
| interest_rate | Decimal | Tasa de interés (%) | No |
| status | Texto | Estado del préstamo | Sí |
| origination_date | Fecha | Fecha de inicio | Sí |
| maturity_date | Fecha | Fecha de vencimiento | Sí |
| created_at | Fecha/Hora | Cuándo se creó | Sí (automático) |

**Estados posibles del préstamo:**

| Estado | Significado |
|--------|-------------|
| pending | Esperando aprobación |
| active | En curso, pagando |
| overdue | Vencido, atrasado |
| paid | Completado |
| canceled | Cancelado |

### 3.3 PAGO

| Atributo | Tipo | Descripción | ¿Obligatorio? |
|----------|------|-------------|----------------|
| id | UUID | Identificador único | Sí |
| loan_id | UUID | Referencia al préstamo (FK) | Sí |
| amount | Decimal | Monto del pago | Sí |
| payment_date | Fecha | Fecha del pago | Sí |
| created_at | Fecha/Hora | Cuándo se registró | Sí (automático) |

**Nota:** Pago es una **entidad débil** — no puede existir sin un préstamo. Si borro el préstamo, se borran sus pagos.

### 3.4 USUARIO

| Atributo | Tipo | Descripción | ¿Obligatorio? |
|----------|------|-------------|----------------|
| id | UUID | Identificador único | Sí |
| email | Texto | Correo electrónico (login) | Sí (único) |
| full_name | Texto | Nombre del prestamista | Sí |
| password_hash | Texto | Contraseña encriptada | Sí |
| created_at | Fecha/Hora | Cuándo se registró | Sí (automático) |

---

## 4. Relaciones entre entidades

### ¿Qué son las relaciones?

Las relaciones indican **cómo se conectan dos entidades**. No basta con saber que existen clientes y préstamos — hay que definir cómo se vinculan.

### 4.1 CLIENTE → PRÉSTAMO

| Aspecto | Descripción |
|---------|-------------|
| **Pregunta** | ¿Un cliente puede tener muchos préstamos? |
| **Respuesta** | Sí. Un cliente puede solicitar varios préstamos a lo largo del tiempo. |
| **Cardinalidad** | **1:N** (uno a muchos) |
| **Significado** | 1 cliente tiene N préstamos. 1 préstamo pertenece a 1 cliente. |

**Ejemplo:**
- Juan (1 cliente) tiene 3 préstamos: $1000, $500, $2000
- Cada préstamo solo pertenece a Juan

### 4.2 PRÉSTAMO → PAGO

| Aspecto | Descripción |
|---------|-------------|
| **Pregunta** | ¿Un préstamo puede tener muchos pagos? |
| **Respuesta** | Sí. Un préstamo se paga en cuotas. |
| **Cardinalidad** | **1:N** (uno a muchos) |
| **Significado** | 1 préstamo tiene N pagos. 1 pago pertenece a 1 préstamo. |

**Ejemplo:**
- Préstamo de Juan de $1000 tiene 4 pagos: $250, $250, $250, $250
- Cada pago solo pertenece a ese préstamo

### 4.3 USUARIO → CLIENTE

| Aspecto | Descripción |
|---------|-------------|
| **Pregunta** | ¿Un usuario puede gestionar muchos clientes? |
| **Respuesta** | Sí. Cada prestamista tiene su propia cartera de clientes. |
| **Cardinalidad** | **1:N** (uno a muchos) |
| **Significado** | 1 usuario tiene N clientes. 1 cliente pertenece a 1 usuario. |

**Ejemplo:**
- María (usuario) tiene 50 clientes registrados
- Pedro (usuario) tiene 30 clientes registrados
- Los clientes de María no se mezclan con los de Pedro

---

## 5. Diagrama Entidad-Relación completo

```
                                    ┌─────────────────┐
                                    │                 │
                                    │    USUARIO      │
                                    │                 │
                                    │  id (PK)        │
                                    │  email          │
                                    │  full_name      │
                                    │  password_hash  │
                                    │  created_at     │
                                    │                 │
                                    └────────┬────────┘
                                             │
                                             │ 1
                                             │
                                             │ N
                                    ┌────────┴────────┐
                                    │                 │
                                    │    CLIENTE      │
                                    │                 │
                                    │  id (PK)        │
                                    │  user_id (FK)   │
                                    │  full_name      │
                                    │  phone          │
                                    │  email          │
                                    │  gov_id         │
                                    │  address        │
                                    │  notes          │
                                    │  created_at     │
                                    │                 │
                                    └────────┬────────┘
                                             │
                                             │ 1
                                             │
                                             │ N
                                    ┌────────┴────────┐
                                    │                 │
                                    │   PRÉSTAMO      │
                                    │                 │
                                    │  id (PK)        │
                                    │  client_id (FK) │
                                    │  amount         │
                                    │  interest_rate  │
                                    │  status         │
                                    │  origination_   │
                                    │    date         │
                                    │  maturity_date  │
                                    │  created_at     │
                                    │                 │
                                    └────────┬────────┘
                                             │
                                             │ 1
                                             │
                                             │ N
                                    ┌────────┴────────┐
                                    │                 │
                                    │     PAGO        │
                                    │                 │
                                    │  id (PK)        │
                                    │  loan_id (FK)   │
                                    │  amount         │
                                    │  payment_date   │
                                    │  created_at     │
                                    │                 │
                                    └─────────────────┘
```

**Leyenda:**
- **PK** = Llave Primaria (identificador único)
- **FK** = Llave Foránea (referencia a otra tabla)
- **1** = Lado "uno" de la relación
- **N** = Lado "muchos" de la relación

---

## 6. Transformación a tablas SQL

Una vez definido el MER, se traduce directamente a tablas en la base de datos:

### Tabla USUARIO

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Tabla CLIENTE

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  gov_id TEXT UNIQUE,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Tabla PRÉSTAMO

```sql
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  interest_rate DECIMAL(5,2),
  status TEXT CHECK (status IN ('pending', 'active', 'overdue', 'paid', 'canceled')),
  origination_date DATE,
  maturity_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Tabla PAGO

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 7. Reglas de integridad

| Regla | Descripción |
|-------|-------------|
| **Integridad de entidad** | Cada fila en una tabla debe ser única (garantizada por la llave primaria) |
| **Integridad referencial** | Un cliente_id en préstamos debe existir en la tabla clientes |
| **Dependencia por existencia** | Si borro un préstamo, se borran sus pagos |
| **Dominio** | Cada columna solo acepta valores de su tipo (texto, número, fecha) |

---

## 8. Ejemplo de datos

### Tabla CLIENTE

| id | full_name | phone | gov_id | user_id |
|----|-----------|-------|--------|---------|
| 1 | Juan Pérez | 555-1234 | V-12345678 | u1 |
| 2 | María López | 555-5678 | V-87654321 | u1 |
| 3 | Carlos Ruiz | 555-9012 | V-11223344 | u2 |

### Tabla PRÉSTAMO

| id | client_id | amount | status | origination_date |
|----|-----------|--------|--------|------------------|
| p1 | 1 | 1000.00 | active | 2024-01-15 |
| p2 | 1 | 500.00 | paid | 2024-02-01 |
| p3 | 2 | 2000.00 | pending | 2024-03-10 |

### Tabla PAGO

| id | loan_id | amount | payment_date |
|----|---------|--------|--------------|
| pg1 | p1 | 250.00 | 2024-02-15 |
| pg2 | p1 | 250.00 | 2024-03-15 |
| pg3 | p2 | 500.00 | 2024-03-01 |

---

## 9. Conclusión

El Modelo de Entidades y Relaciones de Credere define:

- **4 entidades:** Cliente, Préstamo, Pago, Usuario
- **3 relaciones:** Todas de tipo 1:N (uno a muchos)
- **4 tablas** en la base de datos
- **Reglas de integridad** que mantienen la consistencia de los datos

Este modelo es la base para construir la base de datos del sistema y garantiza que la información se organice de forma lógica y sin redundancias.

---

*Documento generado para la entrega de la tarea — Agosto 2026*
