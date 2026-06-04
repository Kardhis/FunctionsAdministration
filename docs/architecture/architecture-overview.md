# Architecture Overview

## 1. Architecture Goals

La arquitectura de FunctionsAdministration debe cumplir los siguientes objetivos:

* Modularidad.
* Escalabilidad.
* Mantenibilidad.
* Seguridad.
* Facilidad de despliegue.
* Facilidad de incorporación de nuevas funcionalidades.
* Separación clara de responsabilidades.
* Alta calidad técnica.

Todas las decisiones técnicas deben favorecer la mantenibilidad a largo plazo frente a soluciones rápidas o temporales.

---

## 2. Architectural Style

La aplicación sigue una arquitectura Full Stack desacoplada basada en API REST.

```text
Frontend (React)
        │
        ▼
REST API
        │
        ▼
Backend (Spring Boot)
        │
        ▼
MySQL
```

Cada capa debe ser independiente y comunicarse exclusivamente mediante contratos bien definidos.

---

## 3. Technology Stack

### Frontend

* React
* Vite
* TypeScript
* Tailwind CSS
* React Router
* TanStack Query
* React Hook Form
* Zod
* Vitest
* React Testing Library

### Backend

* Java 21
* Spring Boot
* Spring Security
* Spring Data JPA
* Bean Validation
* OpenAPI / Swagger

### Database

* MySQL 8

### Infrastructure

* Docker
* Docker Compose
* Nginx
* VPS Linux

### Source Control

* Git
* GitHub

---

## 4. Repository Structure

El repositorio se organiza en módulos claramente separados.

```text
/
├── backend/
├── frontend/
├── docs/
├── scripts/
├── docker-compose.yml
└── README.md
```

### Backend

Contiene:

* Dominio.
* Lógica de negocio.
* Persistencia.
* API REST.
* Seguridad.

### Frontend

Contiene:

* Interfaz de usuario.
* Navegación.
* Gestión de estado de interfaz.
* Integración con API REST.

### Docs

Contiene documentación funcional y técnica del proyecto.

### Scripts

Contiene scripts auxiliares de despliegue, mantenimiento y backup.

---

## 5. Backend Architecture

El backend debe seguir una arquitectura por capas.

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

### Controllers

Responsables exclusivamente de:

* Recibir peticiones.
* Validar entrada.
* Delegar en servicios.
* Devolver respuestas.

No deben contener lógica de negocio.

### Services

Responsables de:

* Implementar reglas de negocio.
* Coordinar operaciones.
* Gestionar transacciones.
* Orquestar procesos.

### Repositories

Responsables exclusivamente del acceso a datos.

No deben contener lógica de negocio.

---

## 6. Domain Design Principles

Las entidades representan el modelo de dominio y la estructura de persistencia.

### Reglas

* No exponer entidades JPA directamente en la API.
* Utilizar DTOs para entrada y salida.
* Mantener separación entre dominio y presentación.
* Evitar lógica compleja dentro de controladores.
* Mantener reglas de negocio dentro de servicios.

### Por qué no exponer entidades JPA

Las entidades representan cómo se almacenan los datos, no cómo deben exponerse al exterior.

Exponer entidades directamente puede provocar:

* Exposición accidental de campos internos.
* Problemas de serialización.
* Dependencia fuerte entre API y base de datos.
* Dificultad para evolucionar el modelo de datos.

### Por qué utilizar DTOs

Los DTOs representan el contrato público de la API.

Beneficios:

* Control total sobre los datos expuestos.
* Validaciones específicas para cada operación.
* Independencia entre API y persistencia.
* Evolución más sencilla del sistema.

---

## 7. API Design Principles

Todas las APIs deben seguir principios REST.

### Convenciones

```text
GET     /api/tasks
GET     /api/tasks/{id}
POST    /api/tasks
PUT     /api/tasks/{id}
DELETE  /api/tasks/{id}
```

### Reglas

* Utilizar JSON.
* Utilizar códigos HTTP correctos.
* Utilizar DTOs.
* Validar entradas.
* Documentar mediante OpenAPI.
* Mantener consistencia entre endpoints.

---

## 8. Security Architecture

La aplicación utiliza autenticación basada en JWT.

### Principios

* Backend stateless.
* Sin sesiones de servidor.
* Tokens JWT para autenticación.
* Roles para autorización.
* Contraseñas cifradas con BCrypt.

### Restricciones

Nunca:

* Almacenar contraseñas en texto plano.
* Desactivar seguridad para resolver problemas temporales.
* Exponer secretos en código fuente.
* Hardcodear credenciales.

---

## 9. Frontend Architecture

La interfaz debe estar completamente desacoplada del backend.

### Principios

* Componentes reutilizables.
* Separación entre UI y llamadas API.
* Gestión clara del estado.
* Diseño responsive desde el inicio.
* Consistencia visual.
* Accesibilidad razonable.

### TypeScript

TypeScript es obligatorio en todo el proyecto frontend.

No deben crearse nuevos componentes en JavaScript salvo justificación expresa.

Beneficios:

* Detección temprana de errores.
* Mejor autocompletado.
* Refactorizaciones más seguras.
* Contratos más claros entre frontend y backend.
* Mejor soporte para herramientas de IA.

### Gestión de Datos

### TanStack Query

Responsable de:

* Consultas al backend.
* Caché.
* Sincronización de datos.
* Invalidación de datos.

Evitar el uso excesivo de:

```javascript
useEffect
fetch
useState
```

para lógica de sincronización con servidor.

### Formularios

Utilizar:

* React Hook Form
* Zod

para formularios y validaciones.

### Estilos

Tailwind CSS es la solución oficial para estilos.

Principios:

* Priorizar utilidades de Tailwind.
* Reutilizar componentes visuales.
* Mantener consistencia visual.
* Minimizar CSS personalizado.

---

## 10. Database Architecture

La base de datos debe modelar correctamente el dominio.

Principios:

* Integridad referencial mediante claves foráneas.
* Evitar duplicación de datos.
* Normalización razonable.
* Índices para consultas frecuentes.
* Migraciones controladas.

Los detalles específicos se documentan en:

```text
docs/database/database-model.md
```

---

## 11. Infrastructure Architecture

Producción se ejecuta mediante contenedores Docker.

Contenedores principales:

```text
functions-frontend
functions-backend
functions-mysql
```

Opcionalmente:

```text
nginx
```

### Comunicación

```text
Internet
    ↓
Nginx
    ↓
Frontend
    ↓
Backend
    ↓
MySQL
```

---

## 12. Documentation Driven Development

Antes de implementar funcionalidades nuevas:

1. Revisar documentación funcional.
2. Revisar arquitectura.
3. Revisar modelo de datos.
4. Diseñar solución.
5. Implementar.
6. Actualizar documentación.

La documentación forma parte del producto y debe mantenerse actualizada.

---

## 13. Future Evolution

La arquitectura debe permitir:

* Nuevos módulos funcionales.
* Multiusuario.
* Automatizaciones.
* Integración con IA.
* Integración con servicios externos.

No se deben introducir complejidades destinadas a resolver problemas que todavía no existen.

---

## 14. Architectural Principles

Todas las decisiones deben respetar:

1. Simplicidad antes que complejidad.
2. Modularidad antes que acoplamiento.
3. Seguridad desde el diseño.
4. Mantenibilidad antes que optimización prematura.
5. Documentación antes que suposición.
6. Escalabilidad razonable.
7. Código limpio y legible.
8. Responsabilidad única.
9. Automatización cuando aporte valor.
10. Calidad antes que velocidad.
