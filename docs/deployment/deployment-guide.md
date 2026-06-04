# Deployment Guide

## 1. Purpose

Este documento define las reglas, procedimientos y criterios técnicos para ejecutar, desplegar y mantener FunctionsAdministration en entornos locales y de producción.

Su objetivo es garantizar:

* Despliegues reproducibles.
* Separación clara entre entornos.
* Seguridad en configuración y secretos.
* Facilidad de mantenimiento.
* Recuperación ante errores.
* Trazabilidad de cambios.
* Compatibilidad con Docker y VPS Linux.

---

## 2. Deployment Principles

Todo despliegue debe seguir estos principios:

1. El código desplegado debe estar versionado en Git.
2. Producción debe desplegarse desde una rama estable.
3. Los secretos nunca deben estar hardcodeados.
4. Las variables de entorno deben gestionarse fuera del código fuente.
5. Los contenedores deben poder recrearse de forma reproducible.
6. La base de datos debe persistir en volúmenes.
7. Antes de desplegar cambios críticos debe existir backup reciente.
8. Los logs deben poder consultarse fácilmente.
9. El despliegue debe minimizar intervención manual.
10. Cualquier incidencia relevante debe documentarse.

---

## 3. Environments

El proyecto contempla los siguientes entornos:

### Local Development

Entorno usado para desarrollo diario.

Características:

* Ejecutado en máquina local.
* Puede usar base de datos local o contenedor Docker.
* Permite hot reload en frontend.
* Permite depuración del backend.

### Production

Entorno real desplegado en VPS Linux.

Características:

* Ejecutado mediante Docker / Docker Compose.
* Base de datos MySQL persistente.
* Backend Spring Boot en contenedor.
* Frontend servido mediante Nginx o contenedor frontend.
* Acceso externo controlado.
* Secrets gestionados mediante variables de entorno o archivos `.env` no versionados.

---

## 4. Official Stack

### Backend

```text
Java 21
Spring Boot
Maven
```

### Frontend

```text
React
Vite
TypeScript
Tailwind CSS
```

### Database

```text
MySQL 8
```

### Infrastructure

```text
Docker
Docker Compose
Nginx
VPS Linux
GitHub
```

---

## 5. Repository Deployment Structure

Estructura esperada del repositorio:

```text
/
├── backend/
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docs/
├── scripts/
├── docker-compose.yml
├── .env.example
└── README.md
```

### Rules

* Los Dockerfiles deben vivir dentro de cada módulo.
* `docker-compose.yml` debe estar en la raíz.
* `.env` no debe versionarse.
* `.env.example` sí debe versionarse como plantilla sin secretos reales.

---

## 6. Environment Variables

Las variables de entorno deben documentarse y gestionarse fuera del código fuente.

### Backend Variables

Ejemplo:

```env
SPRING_PROFILES_ACTIVE=prod

DB_URL=jdbc:mysql://functions-mysql:3306/functions_administration?useUnicode=true&characterEncoding=utf8&serverTimezone=Europe/Madrid
DB_USER=app_user
DB_PASSWORD=change_me

APP_JWT_SECRET=change_me
APP_FRONTEND_BASE_URL=https://example.com

TZ=Europe/Madrid
JAVA_TOOL_OPTIONS=-Duser.timezone=Europe/Madrid
```

### Frontend Variables

Ejemplo:

```env
VITE_API_BASE_URL=https://example.com/api
```

### Rules

* No subir `.env` a Git.
* No escribir secretos en `docker-compose.yml`.
* No hardcodear credenciales en código.
* Mantener `.env.example` actualizado.
* Usar nombres claros y consistentes.

---

## 7. Local Development

### Backend Local

Desde la carpeta `backend`:

```bash
./mvnw spring-boot:run
```

o, si se usa Maven instalado:

```bash
mvn spring-boot:run
```

### Frontend Local

Desde la carpeta `frontend`:

```bash
npm install
npm run dev
```

### Database Local con Docker

Ejemplo:

```bash
docker compose up -d functions-mysql
```

### Rules

* Local puede usar perfil `dev`.
* Producción debe usar perfil `prod`.
* Las configuraciones locales no deben contaminar producción.

---

## 8. Production Deployment

### Standard Deployment Flow

El flujo recomendado para producción es:

```text
1. Revisar cambios en GitHub.
2. Ejecutar tests localmente o en CI.
3. Hacer merge a rama estable.
4. Entrar en el VPS.
5. Actualizar código con git pull.
6. Revisar variables de entorno.
7. Crear backup si hay cambios sensibles.
8. Reconstruir imágenes.
9. Recrear contenedores.
10. Revisar logs.
11. Validar endpoints principales.
```

### Example Commands

Desde la raíz del proyecto en el VPS:

```bash
git pull
docker compose build
docker compose up -d
```

Para reconstruir sin caché cuando sea necesario:

```bash
docker compose build --no-cache
docker compose up -d
```

---

## 9. Docker Compose Services

Servicios esperados:

```text
functions-frontend
functions-backend
functions-mysql
```

### Backend

Responsable de ejecutar la aplicación Spring Boot.

Debe:

* Exponer el puerto interno `8080`.
* Conectarse a MySQL por nombre de servicio Docker.
* Leer configuración desde variables de entorno.
* Usar perfil `prod` en producción.

### Frontend

Responsable de servir la aplicación React compilada.

Debe:

* Construir la aplicación con Vite.
* Servir archivos estáticos mediante Nginx.
* Redirigir rutas SPA correctamente a `index.html`.

### MySQL

Responsable de persistencia.

Debe:

* Usar volumen persistente.
* No exponerse públicamente.
* Permitir acceso externo sólo mediante túnel SSH si es necesario.

---

## 10. Networking and Ports

### Recommended Production Exposure

```text
80    -> HTTP
443   -> HTTPS
8080  -> sólo interno o protegido
3306  -> sólo interno
```

### Rules

* MySQL no debe exponerse públicamente.
* Backend no debería exponerse directamente si Nginx actúa como reverse proxy.
* El frontend debe ser accesible públicamente.
* HTTPS debe configurarse para producción real.

---

## 11. Nginx

Nginx puede actuar como:

* Servidor de frontend.
* Reverse proxy hacia backend.
* Punto de terminación HTTPS.

### SPA Routing

Para React Router, Nginx debe redirigir rutas internas a:

```text
index.html
```

Ejemplo conceptual:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### API Proxy

Ejemplo conceptual:

```nginx
location /api/ {
    proxy_pass http://functions-backend:8080/api/;
}
```

---

## 12. Database Persistence

La base de datos debe usar volúmenes Docker persistentes.

Ejemplo conceptual:

```yaml
volumes:
  mysql_data:
```

### Rules

* Nunca eliminar volúmenes de producción sin backup.
* No usar `docker compose down -v` en producción salvo decisión explícita.
* Validar backups antes de operaciones destructivas.

---

## 13. Backups

Debe existir una estrategia de backup de MySQL.

### Recommended Backup Command

Ejemplo conceptual:

```bash
docker exec functions-mysql \
  mysqldump \
  --no-tablespaces \
  --single-transaction \
  -u"$DB_USER" \
  -p"$DB_PASSWORD" \
  functions_administration \
  | gzip > backup-$(date +"%Y-%m-%d_%H-%M").sql.gz
```

### Backup Rules

* Crear backup antes de migraciones importantes.
* Guardar backups fuera del contenedor.
* Mantener una política de retención.
* Verificar periódicamente que los backups pueden restaurarse.
* No almacenar backups con datos sensibles en ubicaciones públicas.

---

## 14. Restore Procedure

Restaurar una base de datos sólo debe hacerse con cuidado.

Proceso recomendado:

```text
1. Detener temporalmente servicios que escriban en la base de datos.
2. Crear backup del estado actual.
3. Restaurar backup seleccionado.
4. Validar integridad.
5. Arrancar servicios.
6. Revisar logs.
```

Ejemplo conceptual:

```bash
gunzip < backup.sql.gz | docker exec -i functions-mysql \
  mysql \
  -u"$DB_USER" \
  -p"$DB_PASSWORD" \
  functions_administration
```

---

## 15. Logs and Monitoring

### Useful Commands

Ver contenedores:

```bash
docker ps
```

Ver logs del backend:

```bash
docker logs -f functions-backend
```

Ver logs del frontend:

```bash
docker logs -f functions-frontend
```

Ver logs de MySQL:

```bash
docker logs -f functions-mysql
```

Ver logs de todos los servicios:

```bash
docker compose logs -f
```

### Rules

* Revisar logs después de cada despliegue.
* Documentar errores recurrentes.
* No ignorar errores de arranque aunque el contenedor esté en ejecución.

---

## 16. Health Checks

El backend debe exponer un endpoint de salud.

Ejemplo:

```text
GET /api/health
```

El despliegue debe validar:

```text
Frontend carga correctamente.
Login funciona.
Backend responde.
Base de datos conecta.
Endpoints principales funcionan.
```

### Suggested Checks

```bash
curl http://localhost:8080/api/health
```

o vía dominio público:

```bash
curl https://example.com/api/health
```

---

## 17. Production Validation Checklist

Después de desplegar, validar:

```text
[ ] Contenedores activos.
[ ] Backend sin errores críticos.
[ ] Frontend accesible.
[ ] Login funcional.
[ ] API responde correctamente.
[ ] Base de datos conectada.
[ ] No hay errores CORS.
[ ] No hay errores 401/403 inesperados.
[ ] Variables de entorno correctas.
[ ] Logs revisados.
```

---

## 18. Security Rules

### Secrets

Nunca versionar:

```text
.env
*.key
*.pem
credenciales
tokens
passwords
```

### Database

* MySQL no debe exponerse públicamente.
* Usar usuarios con permisos mínimos.
* Evitar uso de `root` para la aplicación.
* Realizar backups periódicos.

### Server

* Usar usuario no-root para administración diaria.
* Mantener sistema actualizado.
* Configurar firewall.
* Permitir SSH sólo con claves cuando sea posible.
* Deshabilitar acceso root por SSH cuando sea seguro hacerlo.

---

## 19. Common Issues

### Port already in use

Error típico:

```text
address already in use
```

Acciones:

```bash
sudo lsof -i :80
sudo lsof -i :8080
```

Decidir si parar el proceso existente o cambiar el puerto.

### Docker Compose file not found

Error típico:

```text
no configuration file provided
```

Acción:

```bash
pwd
ls
```

Verificar que se está ejecutando el comando desde la raíz del proyecto.

### MySQL access denied

Revisar:

* Usuario.
* Password.
* Nombre de base de datos.
* Privilegios.
* Host permitido.
* Variables de entorno.

### Frontend cannot reach backend

Revisar:

* `VITE_API_BASE_URL`.
* CORS.
* Reverse proxy.
* Puerto backend.
* Logs del navegador.
* Logs del backend.

---

## 20. Deployment Anti-Patterns

Evitar:

* Desplegar código no versionado.
* Editar archivos manualmente en producción sin commit.
* Subir `.env` a Git.
* Ejecutar `docker compose down -v` sin backup.
* Exponer MySQL públicamente.
* Usar usuario root de MySQL para la aplicación.
* Desactivar seguridad para resolver problemas rápidos.
* Ignorar logs tras un despliegue.
* Desplegar sin saber qué cambios se están aplicando.
* Modificar producción y luego intentar replicar el cambio en local.

---

## 21. Recommended Cursor / Agent Rules

Cuando Cursor o un agente IA modifique despliegue o infraestructura:

1. Debe leer este documento antes de proponer cambios.
2. Debe explicar el impacto del cambio.
3. Debe evitar cambios destructivos por defecto.
4. Debe preservar variables de entorno existentes.
5. Debe no tocar volúmenes de producción salvo petición explícita.
6. Debe proponer comandos seguros.
7. Debe indicar si un cambio requiere backup previo.
8. Debe validar Docker Compose antes de desplegar.

---

## 22. Final Principle

El despliegue debe ser:

* Reproducible.
* Seguro.
* Documentado.
* Reversible cuando sea posible.
* Comprensible para un desarrollador o agente nuevo.

Producción no debe depender de memoria, improvisación ni cambios manuales no documentados.
