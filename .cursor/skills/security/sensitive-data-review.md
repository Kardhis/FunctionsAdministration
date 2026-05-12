# Sensitive Data Review

When reviewing sensitive data handling:

## Secrets

Never expose:
- passwords
- JWT secrets
- API keys
- database credentials
- private keys

Secrets must not appear in:
- frontend code
- Git commits
- logs
- screenshots
- error responses

## Personal data

Minimize personal data exposure.

Only return fields needed by the UI.

## Logs

Do not log:
- passwords
- tokens
- authorization headers
- database credentials
- private user data unless strictly necessary

## Frontend

Remember:
- frontend code is public to users
- environment variables included in frontend builds are not secret
- `VITE_*` variables are exposed in the browser bundle

## Backend

Use environment variables or secret management.

Validate that missing secrets fail fast during startup.