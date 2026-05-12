# Observability and Logging

When improving observability:

## Application logs

Logs should help diagnose issues without exposing secrets.

Log:
- startup configuration summary without sensitive values
- important business events
- authentication failures without passwords/tokens
- unexpected errors
- external integration failures

Do not log:
- passwords
- JWT tokens
- secrets
- personal sensitive data unnecessarily

## Backend logging

Use appropriate levels:
- ERROR for failures requiring attention
- WARN for suspicious or recoverable issues
- INFO for important lifecycle/business events
- DEBUG for development diagnostics

## Docker logs

Ensure logs are visible through:
- `docker logs`
- container runtime logs
- production monitoring if available

## Health checks

Add useful health endpoints when appropriate:
- application status
- database connectivity
- dependency status

## Debugging production

Prefer:
- logs
- health checks
- metrics
- reproducible commands

Avoid:
- changing production blindly
- exposing debug endpoints publicly