# Authentication Security Audit

When auditing authentication:

## Passwords

Verify:
- passwords are never stored in plain text
- BCrypt or equivalent hashing is used
- password hashes are never exposed
- password checks are centralized

## Login endpoint

Verify:
- invalid credentials return safe messages
- response codes are consistent
- no token is issued on failure
- validation errors are handled correctly

## JWT

Verify:
- signing secret is strong
- signing secret is externalized
- expiration is configured
- token claims are minimal
- token is validated on protected requests

## Frontend

Verify:
- token is not logged
- token is not exposed in URLs
- logout clears auth state
- unauthorized responses are handled

## Production

Verify:
- HTTPS is used
- secrets are environment-based
- logs do not leak credentials