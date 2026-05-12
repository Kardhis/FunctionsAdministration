# Integration Testing Workflow

When creating integration tests:

## Scope

Use integration tests for flows where multiple layers must work together.

Examples:
- authentication
- authorization
- CRUD with database
- validation through REST
- transactional behavior
- error handling

## Backend integration tests

Verify:
- HTTP request
- security filters
- validation
- service logic
- persistence
- response body
- status code

## Database

Use isolated test data.

Prefer:
- test containers when available
- transactional cleanup
- explicit setup
- deterministic assertions

## Critical cases

Always test:
- success path
- invalid request
- unauthorized request
- forbidden request
- not found
- conflict
- server-side validation

## Avoid

- fragile timing assumptions
- reliance on test order
- excessive broad tests that are hard to debug