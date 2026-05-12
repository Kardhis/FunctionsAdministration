# CI/CD Review

When reviewing or creating CI/CD workflows:

## Pipeline goals

The pipeline should verify:
- build success
- tests
- linting/formatting if configured
- security-sensitive failures
- artifact creation
- deployment readiness

## Backend checks

Run:
- Maven build
- unit tests
- integration tests when feasible
- dependency checks if configured

## Frontend checks

Run:
- install dependencies
- build
- tests if configured
- lint if configured

## Deployment

Deployment should:
- use environment variables
- avoid committing secrets
- build immutable artifacts/images
- support rollback where possible

## Safety

Never deploy if:
- tests fail
- build fails
- required environment variables are missing
- secrets are exposed

## Reporting

A good pipeline clearly reports:
- what failed
- where it failed
- logs needed to diagnose