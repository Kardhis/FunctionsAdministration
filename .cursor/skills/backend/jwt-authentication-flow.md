# JWT Authentication Flow

When implementing authentication flows:

## Architecture

Use professional authentication architecture:
- stateless backend
- JWT authentication
- proper authorization checks
- secure token handling
- protected routes
- centralized auth handling

---

## Login flow

Define:
1. login request
2. validation
3. authentication
4. token generation
5. token storage
6. authenticated API usage
7. logout flow
8. token expiration handling

---

## Backend requirements

Implement:
- authentication endpoint
- password hashing
- validation
- proper HTTP status codes
- authorization middleware/filter
- role handling if applicable

Never:
- store plain passwords
- expose sensitive authentication details
- trust frontend-only validation

---

## Frontend requirements

Implement:
- login form
- loading states
- invalid credential handling
- protected routes
- unauthorized redirects
- logout handling

Avoid:
- token leaks
- logging sensitive data
- insecure storage

---

## Security review

Verify:
- CSRF implications
- token expiration
- token refresh strategy
- role validation
- route protection
- secure transport (HTTPS)