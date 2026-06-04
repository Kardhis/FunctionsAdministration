# Database Model

## 1. Purpose

Este documento define las reglas, convenciones y criterios técnicos que deben seguirse en el diseño de la base de datos de FunctionsAdministration.

Su objetivo es garantizar:

* Integridad de datos.
* Consistencia.
* Escalabilidad.
* Mantenibilidad.
* Seguridad.
* Facilidad de evolución del modelo.
* Claridad para desarrolladores y agentes IA.

---

## 2. Database Engine

La base de datos oficial del proyecto es:

```text
MySQL 8
```

Todas las decisiones de modelado, tipos de datos, índices y constraints deben ser compatibles con MySQL 8.

---

## 3. General Design Principles

El diseño de base de datos debe seguir estos principios:

1. Modelo relacional claro.
2. Integridad referencial mediante claves foráneas.
3. Normalización razonable.
4. Evitar duplicación innecesaria de datos.
5. Evitar lógica de negocio compleja dentro de la base de datos.
6. Usar nombres claros y consistentes.
7. Diseñar pensando en futuras ampliaciones.
8. No optimizar prematuramente sin evidencias.
9. Priorizar consistencia antes que comodidad temporal.
10. Documentar cualquier decisión excepcional.

---

## 4. Naming Conventions

### Tables

Las tablas deben nombrarse en inglés, en plural y usando `snake_case`.

Correcto:

```text
users
tasks
task_categories
task_statuses
habit_logs
```

Incorrecto:

```text
User
taskCategory
tbl_tasks
Tareas
```

### Columns

Las columnas deben nombrarse en inglés y usando `snake_case`.

Correcto:

```text
display_name
created_at
updated_at
due_date
planned_date
```

Incorrecto:

```text
displayName
CreatedAt
fecha_limite
```

### Foreign Keys

Las claves foráneas deben nombrarse con el patrón:

```text
<referenced_table_singular>_id
```

Ejemplos:

```text
user_id
task_id
category_id
status_id
```

---

## 5. Primary Keys

Todas las tablas principales deben tener una clave primaria llamada:

```text
id
```

Tipo recomendado:

```sql
BIGINT AUTO_INCREMENT PRIMARY KEY
```

Ejemplo:

```sql
id BIGINT AUTO_INCREMENT PRIMARY KEY
```

No utilizar UUID como clave primaria por defecto salvo que exista una necesidad clara.

---

## 6. Audit Columns

Las tablas principales deben incluir columnas de auditoría.

```sql
created_at DATETIME(6) NOT NULL
updated_at DATETIME(6) NOT NULL
```

y

```sql
created_by BIGINT NOT NULL
updated_by BIGINT NOT NULL
```

cuando tenga sentido funcional.

### Rules

* `created_at` se establece al crear el registro.
* `updated_at` se actualiza cada vez que se modifica el registro.
* Las fechas deben gestionarse desde la aplicación siempre que sea posible.
* Usar zona horaria coherente en todo el sistema.

---

## 7. Soft Delete

Por defecto, no todas las tablas necesitan borrado lógico.

Cuando una tabla contenga datos importantes para trazabilidad, histórico o recuperación, se debe usar:

```sql
deleted_at DATETIME(6) NULL
deleted_by BIGINT NULL
```

o alternativamente:

```sql
is_deleted BOOLEAN NOT NULL DEFAULT FALSE
```

La opción preferida es:

```sql
deleted_at DATETIME(6) NULL
```

porque aporta información temporal adicional.

---

## 8. Boolean Columns

Las columnas booleanas deben nombrarse con prefijos claros:

```text
is_active
is_deleted
is_completed
has_reminder
```

Tipo recomendado en MySQL:

```sql
BOOLEAN NOT NULL DEFAULT FALSE
```

Recordatorio: en MySQL, `BOOLEAN` se interpreta internamente como `TINYINT(1)`.

---

## 9. Date and Time Columns

Usar tipos específicos según el significado del dato.

### Fecha y hora completa

```sql
DATETIME(6)
```

Ejemplos:

```text
created_at
updated_at
completed_at
planned_datetime
```

### Solo fecha

```sql
DATE
```

Ejemplos:

```text
due_date
planned_date
birth_date
```

### Solo hora

```sql
TIME
```

Ejemplos:

```text
planned_time
reminder_time
```

### Rules

* No guardar fechas como `VARCHAR`.
* No mezclar fecha y hora si el dominio sólo necesita fecha.
* Mantener una estrategia coherente de zona horaria.
* Para auditoría, usar preferiblemente `DATETIME(6)`.

---

## 10. Text Columns

Usar el tipo adecuado según longitud esperada.

### Textos cortos

```sql
VARCHAR(255)
```

Ejemplos:

```text
title
name
email
slug
```

### Textos largos

```sql
TEXT
```

Ejemplos:

```text
description
notes
content
```

### Rules

* No usar `TEXT` para campos que deben indexarse frecuentemente.
* Definir longitudes razonables en `VARCHAR`.
* No guardar JSON en texto salvo justificación clara.

---

## 11. Status and Type Fields

Los estados deben modelarse de forma controlada.

Preferir tablas auxiliares.

Ejemplo:

```text
task_statuses
```

Con columnas:

```sql
id BIGINT AUTO_INCREMENT PRIMARY KEY
code VARCHAR(50) NOT NULL UNIQUE
name VARCHAR(100) NOT NULL
description VARCHAR(255) NULL
sort_order INT NOT NULL DEFAULT 0
is_active BOOLEAN NOT NULL DEFAULT TRUE
```

Ejemplos de códigos:

```text
PENDING
IN_PROGRESS
DONE
CANCELLED
```

### Rule

No utilizar strings libres para estados críticos del negocio.

---

## 12. Foreign Keys and Relationships

Todas las relaciones importantes deben estar protegidas mediante claves foráneas reales.

Ejemplo:

```sql
CONSTRAINT fk_tasks_user
FOREIGN KEY (user_id) REFERENCES users(id)
```

### Rules

* Definir claves foráneas explícitas.
* Evitar relaciones ambiguas.
* Evitar columnas tipo `user_id` sin constraint real.
* Documentar reglas de borrado.

### ON DELETE

Usar con cuidado.

Opciones recomendadas:

```sql
ON DELETE RESTRICT
```

para datos críticos.

```sql
ON DELETE SET NULL
```

cuando la relación sea opcional.

Evitar:

```sql
ON DELETE CASCADE
```

salvo que el borrado en cascada sea claramente correcto.

---

## 13. Indexes

Crear índices para:

* Foreign keys.
* Campos usados frecuentemente en filtros.
* Campos usados frecuentemente en búsquedas.
* Campos usados en ordenación.
* Campos únicos.

Ejemplos:

```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status_id ON tasks(status_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE UNIQUE INDEX uk_users_email ON users(email);
```

### Naming

```text
idx_<table>_<column>
uk_<table>_<column>
```

Ejemplos:

```text
idx_tasks_user_id
idx_tasks_due_date
uk_users_email
```

### Rules

* No crear índices sin motivo.
* Revisar índices cuando una consulta sea lenta.
* Evitar índices redundantes.
* Tener en cuenta que los índices mejoran lectura pero penalizan escritura.

---

## 14. Unique Constraints

Usar constraints únicas para reglas reales del dominio.

Ejemplos:

```sql
email VARCHAR(255) NOT NULL UNIQUE
code VARCHAR(50) NOT NULL UNIQUE
```

Preferir constraints reales de base de datos frente a validaciones sólo en backend.

---

## 15. Nullability

Por defecto, las columnas deben ser `NOT NULL`.

Usar `NULL` sólo cuando el dato sea realmente opcional.

Correcto:

```sql
due_date DATE NULL
title VARCHAR(255) NOT NULL
```

Incorrecto:

```sql
title VARCHAR(255) NULL
```

si toda tarea debe tener título.

---

## 16. Monetary Values

Para importes económicos, no usar `FLOAT` ni `DOUBLE`.

Usar:

```sql
DECIMAL(19,4)
```

Ejemplo:

```sql
amount DECIMAL(19,4) NOT NULL
```

---

## 17. JSON Columns

Evitar columnas JSON por defecto.

Sólo deben usarse cuando:

* La estructura sea realmente flexible.
* No haya necesidad frecuente de filtrar por sus campos internos.
* El dato no represente una entidad relacional clara.

Si los datos tienen estructura estable, deben modelarse en tablas relacionales.

---

## 18. Migrations

Toda modificación de base de datos debe estar versionada mediante migraciones.

Herramienta recomendada:

```text
Flyway
```

Convención recomendada:

```text
V1__create_users_table.sql
V2__create_tasks_table.sql
V3__add_due_date_to_tasks.sql
```

### Rules

* No modificar migraciones ya aplicadas en producción.
* Crear una nueva migración para cada cambio.
* Revisar impacto antes de eliminar columnas.
* Añadir migraciones pequeñas y claras.
* Incluir rollback manual documentado cuando el cambio sea delicado.

---

## 19. Seed Data

Los datos iniciales deben separarse claramente de las migraciones estructurales cuando sea posible.

Ejemplos de seed data:

* Estados de tareas.
* Roles.
* Categorías base.
* Configuración inicial.

Ejemplo:

```text
V4__insert_default_task_statuses.sql
```

---

## 20. Security Rules

Nunca almacenar:

* Contraseñas en texto plano.
* Tokens sensibles sin cifrar.
* Secretos de aplicación.
* Credenciales externas.
* Información sensible innecesaria.

Las contraseñas deben almacenarse únicamente como hash seguro generado por la aplicación.

Ejemplo:

```text
password_hash
```

---

## 21. Recommended Base Table Pattern

Ejemplo recomendado para una tabla principal:

```sql
CREATE TABLE tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    status_id BIGINT NOT NULL,

    due_date DATE NULL,
    planned_date DATE NULL,
    planned_time TIME NULL,

    importance TINYINT NULL,
    urgency TINYINT NULL,

    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,

    CONSTRAINT fk_tasks_user
        FOREIGN KEY (user_id) REFERENCES users(id),

    CONSTRAINT fk_tasks_status
        FOREIGN KEY (status_id) REFERENCES task_statuses(id),

    INDEX idx_tasks_user_id (user_id),
    INDEX idx_tasks_status_id (status_id),
    INDEX idx_tasks_due_date (due_date),
    INDEX idx_tasks_planned_date (planned_date)
);
```

---

## 22. Current Core Tables

Actualmente, el proyecto puede incluir o prever las siguientes tablas base:

```text
users
roles
user_roles
features
habits
habit_logs
tasks
task_statuses
task_categories
```

El modelo definitivo debe evolucionar mediante migraciones versionadas.

---

## 23. Data Integrity Rules

El sistema debe proteger la integridad de los datos en tres niveles:

### Database

* Primary keys.
* Foreign keys.
* Unique constraints.
* Not null constraints.
* Índices.

### Backend

* Bean Validation.
* Reglas de negocio.
* Validación de permisos.
* Validación de estados.

### Frontend

* Validación básica de formularios.
* Mensajes de error claros.
* Prevención de entradas inválidas evidentes.

La base de datos debe ser la última línea de defensa.

---

## 24. Change Management

Antes de modificar el modelo de datos:

1. Revisar este documento.
2. Revisar el impacto en entidades JPA.
3. Revisar el impacto en DTOs.
4. Revisar el impacto en servicios.
5. Revisar el impacto en frontend.
6. Crear migración.
7. Ejecutar tests.
8. Documentar el cambio.

---

## 25. Anti-Patterns

Evitar:

* Tablas sin clave primaria.
* Relaciones sin foreign key.
* Estados como strings libres sin validación.
* Fechas guardadas como texto.
* Importes guardados como `FLOAT`.
* Campos booleanos con nombres ambiguos.
* Columnas genéricas tipo `data`, `value`, `info` sin justificación.
* Tablas con demasiadas responsabilidades.
* Cambios manuales en producción sin migración.
* Modificar migraciones ya aplicadas.
* Exponer estructura interna de base de datos directamente al frontend.

---

## 26. Final Principle

La base de datos debe diseñarse como una parte crítica del producto, no como un detalle técnico secundario.

Un buen modelo de datos debe ser:

* Claro.
* Consistente.
* Evolutivo.
* Seguro.
* Fácil de entender.
* Difícil de corromper accidentalmente.
