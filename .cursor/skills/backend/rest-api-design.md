# REST API Design

When designing REST APIs:

## Resource naming

Use nouns, not verbs.

Good:
- `/api/habits`
- `/api/habits/{id}`
- `/api/habit-entries`

Bad:
- `/api/createHabit`
- `/api/deleteHabit`

## HTTP methods

Use:
- `GET` to read
- `POST` to create
- `PUT` to replace
- `PATCH` to partially update
- `DELETE` to delete

## Status codes

Use:
- `200 OK` for successful reads/updates
- `201 Created` for creations
- `204 No Content` for successful deletes without body
- `400 Bad Request` for validation errors
- `401 Unauthorized` for unauthenticated requests
- `403 Forbidden` for authenticated but forbidden requests
- `404 Not Found` for missing resources
- `409 Conflict` for business conflicts

## DTOs

Use DTOs for request and response.

Avoid exposing entities directly.

## Pagination

For lists that can grow:
- use pagination
- avoid returning unbounded data
- define sorting explicitly when needed

## Filtering

Use query parameters for filters.

Example:
- `/api/habits?active=true`
- `/api/habit-entries?from=2026-05-01&to=2026-05-31`

## Error responses

Keep error responses consistent.

Include:
- status
- title
- detail
- path
- timestamp when useful

Do not expose internal implementation details.