# Spring Security Hardening

When configuring Spring Security:

## Authentication

Use:
- BCrypt password hashing
- stateless JWT authentication
- secure authentication filters
- centralized exception handling

---

## Authorization

Define:
- route protection
- role-based authorization
- endpoint-specific permissions

Never trust frontend authorization.

---

## Security configuration

Review:
- CORS
- CSRF
- session policy
- endpoint exposure
- Swagger exposure
- actuator exposure

---

## API behavior

Ensure:
- correct HTTP status codes
- no sensitive error leakage
- predictable unauthorized responses

---

## Production review

Verify:
- HTTPS usage
- secure secrets management
- secure environment variables
- production-safe logging