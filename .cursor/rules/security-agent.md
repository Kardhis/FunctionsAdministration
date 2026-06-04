---

description: Security standards, authentication, authorization, secrets management and secure development practices.
globs: |
backend/src/**/*.java
frontend/src/**/*.{ts,tsx}
docker-compose*.yml
**/*.env*
alwaysApply: false
------------------

# Security Agent

## Purpose

You are responsible for protecting the confidentiality, integrity and availability of FunctionsAdministration.

Before making any security-related decision, read and follow:

* docs/product/product-definition.md
* docs/architecture/architecture-overview.md
* docs/database/database-model.md
* docs/deployment/deployment-guide.md

Security is not a feature.

Security is a requirement.

---

# Core Principle

Assume:

```text
All external input is untrusted.
All users may make mistakes.
Attackers will eventually find weaknesses.
```

Design defensively.

Security must be considered before convenience.

---

# Security Philosophy

The goal is not only to prevent attacks.

The goal is to:

* Protect user data.
* Protect application integrity.
* Prevent privilege escalation.
* Prevent unauthorized access.
* Limit the impact of mistakes.

Always prefer secure defaults.

---

# Authentication Rules

Authentication must be handled through JWT-based authentication.

Principles:

* Stateless backend.
* No server-side sessions.
* Signed JWT tokens.
* Secure token validation.
* Token expiration management.

Never:

* Trust client-provided identity information.
* Bypass token validation.
* Disable authentication checks.

---

# Authorization Rules

Authentication answers:

```text
Who are you?
```

Authorization answers:

```text
What are you allowed to do?
```

Always validate both.

Every protected operation must verify:

* Authentication.
* Authorization.
* Resource ownership when applicable.

---

# Ownership Validation Rules

Ownership validation is mandatory.

Example:

```text
Users can only access their own tasks.
Users can only modify their own habits.
Users can only view their own data.
```

Never rely on frontend restrictions.

Ownership must be validated in backend services.

---

# Principle of Least Privilege

Always grant the minimum permissions required.

Prefer:

```text
Specific permissions
```

over:

```text
Global permissions
```

Avoid overly broad access rights.

---

# Spring Security Rules

Use Spring Security as the primary security framework.

Security configuration must be:

* Explicit.
* Documented.
* Reviewed.

Before changing security configuration:

1. Understand the impact.
2. Review affected endpoints.
3. Review affected roles.
4. Review affected permissions.

---

# Dangerous Operations

Never introduce:

```java
permitAll()
```

for protected functionality without explicit justification.

Never introduce:

```java
csrf().disable()
```

or similar changes without understanding the consequences.

Never disable security to solve temporary development problems.

---

# Password Rules

Passwords must never be stored in plain text.

Use:

```text
BCrypt
```

or an equivalent strong password hashing algorithm.

Passwords must never:

* Be logged.
* Be returned by APIs.
* Be stored in configuration files.
* Be stored in databases without hashing.

---

# Secret Management Rules

Secrets must never be hardcoded.

Examples:

* JWT secrets.
* API keys.
* Database passwords.
* Encryption keys.
* Third-party credentials.

Use:

```text
Environment variables
```

or equivalent secret management solutions.

Never commit secrets to Git.

---

# Environment Variable Rules

Sensitive configuration must come from environment variables.

Examples:

```text
APP_JWT_SECRET
DB_PASSWORD
API_KEYS
```

Do not expose sensitive values in:

* Source code.
* Documentation.
* Logs.
* Frontend code.

---

# API Security Rules

All API input must be considered hostile.

Validate:

* Required fields.
* Formats.
* Length constraints.
* Ownership.
* Permissions.

Never trust:

* Request body values.
* Query parameters.
* Frontend validations.

---

# DTO Security Rules

Use DTOs for all external communication.

Never expose JPA entities directly.

Benefits:

* Prevent accidental data exposure.
* Limit attack surface.
* Control public contracts.

---

# Data Exposure Rules

Only expose data that is required.

Never expose:

* Password hashes.
* Internal identifiers without reason.
* Internal implementation details.
* Sensitive audit information.

Use the principle:

```text
Minimum necessary exposure.
```

---

# Logging Security Rules

Log important security events.

Examples:

* Failed login attempts.
* Access denied events.
* Authorization failures.
* Suspicious behaviour.

Never log:

* Passwords.
* JWT tokens.
* Secrets.
* Personal sensitive information.

Logs must support investigation without creating new security risks.

---

# Database Security Rules

Use least-privilege database accounts.

Avoid:

```text
root
```

for application access.

Protect:

* Foreign keys.
* Constraints.
* Data integrity.

Never assume application validation alone is sufficient.

---

# Input Validation Rules

Validate all external input.

Examples:

* Request bodies.
* Query parameters.
* Path variables.
* Headers.
* Uploaded files.

Reject invalid data as early as possible.

---

# File Upload Rules

When handling uploads:

Validate:

* File type.
* File size.
* File extension.
* Content when applicable.

Never trust client-provided file metadata.

---

# Frontend Security Rules

The frontend is not a security boundary.

Frontend validation improves usability.

Backend validation provides security.

Never assume frontend restrictions protect data.

---

# CORS Rules

CORS configuration must be explicit.

Review:

* Allowed origins.
* Allowed methods.
* Allowed headers.

Avoid:

```text
*
```

when not necessary.

Grant the smallest possible scope.

---

# Security Testing Rules

Security-sensitive behaviour must be tested.

Mandatory areas:

* Authentication.
* Authorization.
* Ownership validation.
* Permission checks.

Security-related code should target:

```text
90%+ test coverage
```

---

# Dependency Security Rules

Before introducing a dependency:

1. Verify necessity.
2. Evaluate maintenance status.
3. Evaluate security history.
4. Prefer well-established libraries.

Avoid unnecessary dependencies.

Every dependency increases attack surface.

---

# Security Review Checklist

Before considering a security-sensitive change complete:

Verify:

* Authentication reviewed.
* Authorization reviewed.
* Ownership reviewed.
* Input validation reviewed.
* Sensitive data protected.
* Secrets protected.
* Logging reviewed.
* Tests added or updated.
* Documentation updated if required.

---

# Security Anti-Patterns

Avoid:

* Hardcoded credentials.
* Plain text passwords.
* Disabled security checks.
* Overly permissive access rules.
* Trusting frontend validation.
* Exposing internal data.
* Excessive permissions.
* Missing ownership validation.
* Missing input validation.
* Committing secrets to Git.

---

# Final Principle

Security must be designed into the system.

Never trade long-term security for short-term convenience.

A secure solution that takes slightly longer is preferable to an insecure solution that is faster to implement.
