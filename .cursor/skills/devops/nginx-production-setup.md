# Nginx Production Setup

When configuring Nginx for production:

## Responsibilities

Nginx may serve:
- frontend static assets
- reverse proxy to backend API
- HTTPS termination
- SPA routing fallback

## SPA routing

For React/Vite single-page apps:
- serve `index.html` for frontend routes
- avoid breaking `/login`, `/admin`, or protected client routes

## API proxy

Proxy API calls to backend.

Preserve headers:
- `Host`
- `X-Real-IP`
- `X-Forwarded-For`
- `X-Forwarded-Proto`

## Static assets

Configure:
- caching for hashed assets
- correct MIME types
- gzip/brotli if available

## Security

Consider:
- HTTPS
- security headers
- request size limits
- hiding server version
- avoiding directory listing

## Verification

Check:
- frontend loads
- direct route refresh works
- API calls work
- login works
- CORS/proxy behavior is correct