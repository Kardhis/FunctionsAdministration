# Backend Testing Strategy

When testing backend code:

## Service tests

Use service tests for:
- business logic
- domain rules
- transactional behavior
- edge cases

Mock repositories only when it improves focus.

## Controller tests

Use controller tests for:
- HTTP status codes
- request validation
- response format
- security behavior
- error responses

## Repository tests

Use repository tests for:
- custom queries
- database constraints
- pagination
- sorting
- projections

## Integration tests

Use integration tests for critical flows:
- login
- protected endpoints
- CRUD workflows
- database persistence
- security filters

## Test data

Keep test data:
- explicit
- readable
- minimal
- isolated

Avoid depending on execution order.

## Assertions

Assert meaningful behavior.

Avoid testing private implementation details.