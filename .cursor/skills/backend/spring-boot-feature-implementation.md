# Spring Boot Feature Implementation

When implementing a backend feature in Spring Boot:

## 1. Understand the domain

Before coding:
- Identify the business concept.
- Identify entities, value objects, DTOs, repositories, services, and controllers involved.
- Check existing naming and package conventions.
- Reuse existing patterns.

## 2. Respect layered architecture

Use this flow:

Controller → Service → Repository → Database

Rules:
- Controllers handle HTTP concerns only.
- Services contain business logic.
- Repositories access persistence only.
- DTOs define API input/output.
- Entities must not be exposed directly through REST unless explicitly intended.

## 3. API contract

Define:
- endpoint path
- HTTP method
- request DTO
- response DTO
- status codes
- validation errors
- authorization rules

Use proper HTTP semantics:
- `200 OK`
- `201 Created`
- `204 No Content`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`

## 4. Validation

Use Bean Validation where appropriate:
- `@NotNull`
- `@NotBlank`
- `@Size`
- `@Email`
- custom validators if needed

Never rely only on frontend validation.

## 5. Transactions

Use `@Transactional` in service layer.

Rules:
- Read operations may use `@Transactional(readOnly = true)`.
- Write operations must be transactional.
- Avoid transactions in controllers.

## 6. Error handling

Use centralized exception handling.

Avoid:
- leaking stack traces
- returning raw exceptions
- ambiguous error messages

Prefer:
- clear domain-specific exceptions
- consistent API error responses

## 7. Testing

For every backend feature, consider:
- service unit tests
- controller tests
- repository tests if queries are complex
- integration tests for critical flows