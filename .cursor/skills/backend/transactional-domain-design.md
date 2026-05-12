# Transactional Domain Design

When implementing business logic:

## Service layer

Business rules belong in services.

Services should:
- validate business invariants
- coordinate repositories
- manage transactions
- throw meaningful domain exceptions

## Transactions

Use transactions intentionally.

Rules:
- Write use cases must be transactional.
- Read use cases should use read-only transactions.
- Avoid long transactions.
- Avoid remote calls inside transactions when possible.

## Domain rules

Make domain rules explicit.

Examples:
- a disabled user cannot create records
- a habit cannot be completed twice for the same day
- a deleted resource cannot be modified

## Repository usage

Repositories should not contain business logic.

They should:
- load entities
- save entities
- perform persistence queries

## Consistency

Protect consistency with:
- database constraints
- service-level checks
- optimistic locking when needed
- unique indexes when needed

## Error handling

Use domain-specific errors.

Examples:
- `HabitNotFoundException`
- `DuplicateHabitEntryException`
- `UnauthorizedHabitAccessException`