---

description: Backend and frontend testing standards, validation strategy and quality assurance rules.
globs: |
backend/src/test/**/*.java
frontend/src/**/*.test.ts
frontend/src/**/*.test.tsx
backend/src/**/*.java
frontend/src/**/*.{ts,tsx}
alwaysApply: false
------------------

# Testing Agent

## Purpose

You are responsible for protecting the quality, stability and reliability of FunctionsAdministration through automated testing.

Before making any testing-related decision, read and follow:

* docs/product/product-definition.md
* docs/architecture/architecture-overview.md
* docs/database/database-model.md

Testing is not optional.

Tests are part of the product.

---

# Core Principle

Do not pursue coverage numbers blindly.

Pursue covered risk.

A feature is not considered complete when the code compiles.

A feature is complete when:

* The code works.
* The relevant risks are covered.
* The behaviour is validated.
* Automated tests exist.
* Existing tests still pass.

---

# Testing Philosophy

The goal of testing is not to increase coverage metrics.

The goal is to verify business behaviour and reduce product risk.

Tests should provide confidence that:

* Features work correctly.
* Bugs do not reappear.
* Refactoring can be performed safely.
* Future developers understand expected behaviour.
* Critical workflows are protected.

---

# Coverage Targets

Coverage is a quality indicator, not the final goal.

Recommended targets:

```text
Minimum overall coverage: 80%
Minimum service layer coverage: 90%
Minimum security-related coverage: 90%
Minimum validation-related coverage: 90%
```

Prioritize:

1. Business rules.
2. Security-sensitive logic.
3. Validation rules.
4. Critical workflows.
5. Data integrity.
6. Bug regression scenarios.

Branch coverage is more valuable than simple line coverage.

Avoid meaningless tests created only to increase coverage.

---

# Mandatory Test Evaluation

Every code change must be evaluated for testing impact.

Whenever production code changes:

1. Review existing tests.
2. Identify affected behaviour.
3. Identify affected risks.
4. Update existing tests if required.
5. Create new tests if required.
6. Ensure all tests pass.

Never modify production code without considering test impact.

---

# Backend Testing Standards

Official framework:

```text
JUnit 5
```

Preferred supporting libraries:

```text
Mockito
AssertJ
Spring Boot Test
JaCoCo
```

For critical business logic, mutation testing may be considered.

Recommended tool:

```text
PIT Mutation Testing
```

All backend functionality should be testable.

---

# Service Layer Testing

Service layer tests are mandatory.

Business logic must be validated through automated tests.

Target:

```text
90%+ coverage for service layer code
```

Examples:

* Task creation.
* Task completion.
* Status transitions.
* Habit tracking.
* User management.
* Validation rules.
* Ownership rules.

Services contain business rules and therefore require the highest testing priority.

---

# Repository Testing

Repository tests should verify:

* Queries.
* Filtering.
* Pagination.
* Sorting.
* Persistence behaviour.

Test database interactions whenever custom queries are introduced.

Simple inherited CRUD operations do not require excessive testing unless they support critical behaviour.

---

# Controller Testing

Controllers should be tested when:

* Request validation exists.
* Security restrictions exist.
* Complex request handling exists.
* API contracts are important.

Focus on:

* Request validation.
* HTTP status codes.
* API contracts.
* Error responses.
* Authorization behaviour.

---

# Security Testing

Security-sensitive behaviour must be tested.

Target:

```text
90%+ coverage for security-sensitive logic
```

Examples:

* Authentication.
* Authorization.
* Ownership validation.
* Access restrictions.
* Role-based permissions.

Verify:

* Authorized access works.
* Unauthorized access is blocked.
* Forbidden operations are rejected.
* Users cannot access resources they do not own.

---

# Validation Testing

Validation rules must be tested.

Target:

```text
90%+ coverage for validation-related logic
```

Examples:

```java
@NotBlank
@NotNull
@Size
@Email
```

Tests should verify both:

* Valid input.
* Invalid input.

---

# Frontend Testing Standards

Official frameworks:

```text
Vitest
React Testing Library
```

Frontend tests should focus on behaviour rather than implementation details.

Prefer:

* User interactions.
* Form validation.
* Conditional rendering.
* Component behaviour.
* Critical user workflows.

Avoid testing internal implementation details.

---

# Regression Testing Rules

Every bug fix must create a regression test.

Process:

1. Reproduce the bug.
2. Create a failing test.
3. Implement the fix.
4. Verify the test passes.

A bug is not considered fully fixed until a regression test exists.

---

# Test Naming Rules

Test names should clearly describe behaviour.

Prefer:

```java
shouldCreateTaskWhenRequestIsValid()
```

```java
shouldRejectTaskCreationWhenTitleIsMissing()
```

Avoid:

```java
test1()
```

```java
createTaskTest()
```

Test names should describe expected behaviour.

---

# Test Structure Rules

Prefer:

```text
Arrange
Act
Assert
```

Tests should be easy to read and understand.

---

# Mocking Rules

Mock external dependencies only.

Examples:

* External APIs.
* Email services.
* Third-party integrations.

Avoid excessive mocking.

Prefer testing real business behaviour whenever possible.

Do not mock the class under test.

---

# Coverage Quality Rules

High coverage with weak assertions is not acceptable.

Avoid tests that only verify:

```java
assertNotNull(result);
```

when stronger behavioural assertions are possible.

Prefer assertions that verify:

* State changes.
* Returned values.
* Exceptions.
* Security restrictions.
* Persistence effects.
* Business rule outcomes.

---

# Maintainability Rules

Tests are production assets.

Apply the same standards used for production code:

* Clear naming.
* Readable structure.
* No duplication.
* Good documentation.

Poor tests are technical debt.

---

# Documentation Rules

Complex test scenarios should include explanatory comments.

Explain:

* Why the test exists.
* Which business rule it protects.
* Which regression it prevents.

Avoid comments that merely repeat the code.

---

# Continuous Validation Rules

Before considering a task complete:

Verify:

* Tests compile.
* Tests execute successfully.
* Existing tests remain green.
* New functionality is covered.
* Relevant risks are covered.

Never leave failing tests committed.

Never disable tests to make builds pass.

---

# Anti-Patterns

Avoid:

* Tests without assertions.
* Meaningless coverage tests.
* Duplicate tests.
* Excessive mocking.
* Fragile implementation-dependent tests.
* Random behaviour.
* Sleep-based timing tests.
* Ignoring failing tests.
* Commenting out tests.
* Deleting tests to make builds pass.

---

# Change Review Checklist

Before considering a task complete:

* Existing tests reviewed.
* Test impact analyzed.
* Covered risks identified.
* New tests added if required.
* Regression tests added for bug fixes.
* Business rules validated.
* Security-sensitive logic tested.
* Validation rules tested.
* Coverage targets considered.
* All tests passing.
* No obsolete tests remain.

The goal is not simply to write tests.

The goal is to protect the product against future regressions and enable safe evolution of the codebase.
