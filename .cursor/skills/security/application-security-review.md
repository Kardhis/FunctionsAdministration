# Application Security Review

When reviewing application security:

## Authentication

Check:
- password hashing
- login behavior
- token generation
- token expiration
- logout handling
- brute-force considerations

## Authorization

Check:
- protected endpoints
- role checks
- user ownership checks
- backend enforcement

Never rely only on frontend authorization.

## Input validation

Check:
- request DTO validation
- frontend validation
- backend validation
- SQL/JPQL safety
- unsafe HTML rendering

## Sensitive data

Ensure secrets are not stored in:
- code
- frontend bundles
- Git
- logs
- error responses

## Error handling

Avoid exposing:
- stack traces
- internal class names
- SQL details
- secret values
- token values

## Transport

Production should use HTTPS.

Review:
- CORS
- cookies if used
- security headers
- proxy headers