# FunctionsAdministration

Monorepo: **Spring Boot** backend (`backend/`) y **React + Vite** frontend (`frontend/`). Autenticación con **JWT en cookie HttpOnly** y API REST bajo `/api/**`.

## Requisitos

- JDK 17+, Maven 3.6+
- Node 20+ (recomendado), npm
- MySQL 8+ y base de datos creada (`functions_administration`)

## Configuración del backend

### Perfiles

| Perfil | Uso |
|--------|-----|
| `dev` (por defecto) | Desarrollo local: `application-dev.yml` (secretos vía variables de entorno). |
| `prod` | Producción: credenciales vía variables de entorno (`application-prod.yml`). |

`SPRING_PROFILES_ACTIVE` controla el perfil (por defecto `dev`).

### Variables de entorno (resumen)

**Desarrollo (`dev`)**

| Variable | Descripción |
|----------|-------------|
| `DB_URL` | JDBC MySQL (obligatorio en dev con la configuración actual). |
| `DB_USER` / `DB_PASSWORD` | Credenciales MySQL (obligatorias en dev). |
| `APP_JWT_SECRET` | Secreto HMAC del JWT (obligatorio en dev con la configuración actual; definir en el entorno). |
| `APP_DEMO_SEED_USER` | `true` para crear en el arranque el usuario demo `adminuser@mail.com` / `password` con roles ADMIN+USER. |
| `APP_CORS_ALLOWED_ORIGINS` | Orígenes CORS separados por comas (por defecto `http://localhost:5173`). |

**Producción (`prod`)**

Obligatorias: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `APP_JWT_SECRET`.  
Recomendado: `APP_CORS_ALLOWED_ORIGINS` con el origen HTTPS del frontend.

En producción: cookie `Secure`, OpenAPI desactivado, semilla demo desactivada.

## Arranque local

1. MySQL con la base creada y usuario/contraseña acordes a `DB_*`.
2. Backend (desde `backend/`):

   ```bash
   mvn spring-boot:run
   ```

   Para usuario demo en la primera ejecución:

   ```bash
   set APP_DEMO_SEED_USER=true
   mvn spring-boot:run
   ```

   (En PowerShell: `$env:APP_DEMO_SEED_USER="true"`.)

3. Frontend (desde `frontend/`):

   ```bash
   npm install
   npm run dev
   ```

   Opcional: `VITE_API_BASE` apuntando al backend (por defecto `http://localhost:8080`).

## Tests y cobertura

**Backend**

```bash
cd backend
mvn test
mvn verify
```

`mvn verify` genera informe JaCoCo en `backend/target/site/jacoco/`.

**Frontend**

```bash
cd frontend
npm test
npm run test:coverage
```

Informe en `frontend/coverage/`.

## Seguridad (notas)

- CSRF deshabilitado: API stateless con JWT en cookie; mitigación habitual con `SameSite` y orígenes CORS acotados. Valorar tokens CSRF o doble cookie si el modelo de amenazas lo exige.
- No commitear `application-local.yml` (o `.properties`) con secretos reales; usar `.env` local (no versionado) o variables del IDE.

## Estructura

- `backend/src/main/java` — controladores, seguridad, dominio JPA; configuración en `resources/application.yml` (+ `application-dev.yml` / `application-prod.yml`); Flyway en `resources/db/migration`.
- `frontend/src` — rutas, `auth/`, `data/api.js`, features por carpeta.
