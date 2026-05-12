# Docker Production Deployment

When preparing production deployment:

## Containers

Verify:
- minimal images
- environment separation
- restart policies
- health checks
- proper networking

---

## Secrets

Never:
- commit secrets
- hardcode credentials
- expose sensitive env vars

Use:
- environment variables
- secure secret handling

---

## Reverse proxy

Verify:
- nginx configuration
- HTTPS
- proxy headers
- SPA routing
- API routing

---

## Backend

Verify:
- production profiles
- logging configuration
- timezone configuration
- database connectivity
- CORS configuration

---

## Frontend

Verify:
- production API URL
- asset optimization
- correct routing behavior

---

## Observability

Verify:
- logs
- container status
- restart behavior
- error visibility