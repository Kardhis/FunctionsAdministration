# Bug Investigation Workflow

When investigating a bug:

## 1. Reproduce

First determine:
- exact steps to reproduce
- expected behavior
- actual behavior
- affected environment
- relevant logs/errors

## 2. Locate

Identify whether the bug is likely in:
- frontend
- backend
- database
- authentication/security
- configuration
- deployment
- network/CORS/proxy

## 3. Narrow down

Use evidence:
- browser console
- network tab
- backend logs
- database state
- container logs
- stack traces
- failing tests

## 4. Fix minimally

Fix the root cause.

Avoid broad rewrites unless necessary.

## 5. Prevent regression

Add or update tests when possible.

## 6. Report

Explain:
- root cause
- files changed
- why the fix works
- how it was verified