# Production Readiness Review

When reviewing production readiness:

## 1. Build

Verify:
- frontend builds successfully
- backend builds successfully
- tests pass or known gaps are documented
- production configuration is separated from development

## 2. Configuration

Check:
- environment variables
- secrets management
- API base URLs
- database connection
- timezone configuration
- logging configuration

## 3. Security

Review:
- authentication
- authorization
- CORS
- CSRF
- HTTPS
- exposed endpoints
- secret leakage
- error message leakage

## 4. Database

Verify:
- schema is correct
- migrations are safe
- indexes exist for critical queries
- backups are considered
- production credentials are externalized

## 5. Frontend

Check:
- routing works on refresh
- API calls target production backend
- responsive layout is acceptable
- error/loading states exist
- no debug UI remains

## 6. Backend

Check:
- health endpoint
- graceful error handling
- validation
- transaction boundaries
- production profile
- logs are useful and safe

## 7. Docker and deployment

Review:
- Docker images
- docker-compose configuration
- restart policies
- networking
- ports
- volumes
- reverse proxy
- HTTPS

## 8. Observability

Check:
- application logs
- container logs
- health checks
- error diagnosis path
- monitoring plan if applicable

## 9. Final report

Return:
- production blockers
- high-priority improvements
- medium-priority improvements
- acceptable risks
- deployment checklist