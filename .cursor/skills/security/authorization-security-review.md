# Authorization Security Review

When reviewing authorization:

## Backend enforcement

Authorization must be enforced on the backend.

Check:
- endpoint protection
- role-based rules
- ownership checks
- service-level safeguards

## Common risks

Watch for:
- users accessing other users' data
- admin routes exposed to normal users
- hidden frontend buttons being the only protection
- missing checks in update/delete operations

## Tests

Add tests for:
- unauthenticated access
- authenticated but forbidden access
- authorized access
- ownership violations
- admin-only endpoints

## API responses

Use:
- `401` when not authenticated
- `403` when authenticated but not allowed
- `404` carefully when hiding resource existence is desired

## Final review

For every protected feature, answer:
- Who can access it?
- Who cannot access it?
- Where is this enforced?
- Is there a test proving it?