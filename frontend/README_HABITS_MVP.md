# Hábitos (MVP) — arquitectura y uso

Este proyecto incluye un módulo profesional de **tracking de hábitos por tiempo** dentro del dashboard.

## Qué resuelve (MVP)

- CRUD de **hábitos** (color, icono, categoría, activo/inactivo, objetivos).
- CRUD de **registros** (fecha + inicio/fin 24h + duración automática + nota).
- **Persistencia real** en el navegador vía **IndexedDB** (no depende solo de memoria).
- **Estadísticas** con filtros por periodo + gráficos (Recharts).
- **Temporizador en vivo** para crear registros sin escribir horas manualmente.
- **Exportación** CSV/JSON (MVP) desde Ajustes.
- **Dark mode** persistido (local) con `data-theme` en `documentElement`.

## Rutas

Dentro del dashboard:

- `/dashboard/habits/overview`: dashboard del módulo
- `/dashboard/habits/manage`: gestión de hábitos
- `/dashboard/habits/log`: registros + temporizador
- `/dashboard/habits/week`: vista semanal
- `/dashboard/habits/analytics`: analítica (evita colisión con `/dashboard/stats`)
- `/dashboard/habits/settings`: ajustes + exportación + base de recordatorios

## Arquitectura (carpetas)

- `src/features/habits/domain/`: reglas + agregaciones + periodos (funciones puras)
- `src/features/habits/data/`: IndexedDB (`idb`) + repos
- `src/features/habits/store/`: Zustand (casos de uso UI-friendly)
- `src/features/habits/pages/`: pantallas del módulo
- `src/features/habits/ui/`: layout interno + componentes UI del módulo
- `src/features/habits/seed/`: seed determinista si la DB está vacía

## Stack añadido

- `zod` + `react-hook-form` + `@hookform/resolvers`
- `zustand`
- `date-fns`
- `idb`
- `recharts`
- `papaparse` (CSV)
- `vitest` (tests mínimos de utilidades)

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm test`

## Migración futura a Spring Boot

La capa `src/features/habits/data/*Repo*.js` está pensada como “puerto”:

- Hoy: repos IndexedDB
- Mañana: repos HTTP (`fetch`) con los mismos métodos (`list*`, `put*`, `delete*`)

Recomendación de API (alto nivel):

- `GET/POST/PUT/DELETE /api/habits`
- `GET/POST/PUT/DELETE /api/habit-entries`
- `GET /api/habit-stats?from=...&to=...` (agregados server-side opcional)

## Notas / próximos pasos

- Code-splitting de charts (el bundle crece por Recharts).
- Objetivos: enriquecer reglas (p.ej. “min/semana” vs “sesiones/semana”) con validación por tipo.
- Recordatorios: evolucionar de stub IndexedDB a push/email + scheduler backend.
