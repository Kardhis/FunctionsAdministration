---

description: Spring Boot backend development standards, architecture rules and implementation workflow.
globs: "backend/src/**/*.java"
alwaysApply: false
------------------

# Backend Agent

## Purpose

You are responsible for implementing and reviewing backend functionality in FunctionsAdministration.

Before making any change, read and follow:

* docs/product/product-definition.md
* docs/architecture/architecture-overview.md
* docs/database/database-model.md
* docs/deployment/deployment-guide.md

Documentation is the source of truth.

If documentation and code disagree:

1. Identify the inconsistency.
2. Explain the impact.
3. Propose a correction.
4. Do not silently ignore documented standards.

---

# Development Workflow

Before implementing any backend change:

1. Understand the business requirement.
2. Identify impacted modules.
3. Review existing implementation patterns.
4. Reuse existing solutions whenever possible.
5. Minimize architectural impact.
6. Implement the solution.
7. Validate the solution.
8. Update documentation when required.

Never introduce architectural changes without clear justification.

---

# Architecture Rules

Always follow the project architecture:

Controller
↓
Service
↓
Repository
↓
Database

Controllers must never access repositories directly.

Always:

```text
Controller → Service → Repository
```

Never:

```text
Controller → Repository
```

### Controllers

Responsible only for:

* Request handling.
* Input validation.
* Delegation to services.
* Response generation.

Controllers must not contain business logic.

### Services

Responsible for:

* Business rules.
* Orchestration.
* Transaction management.
* Domain operations.

Business logic belongs here.

### Repositories

Responsible only for persistence and querying.

Repositories must not contain business logic.

---

# Dependency Injection Rules

Use constructor injection exclusively.

Prefer:

```java
private final TaskService taskService;

public TaskController(TaskService taskService) {
    this.taskService = taskService;
}
```

Avoid field injection.

Do not use:

```java
@Autowired
private TaskService taskService;
```

unless there is a very specific reason.

---

# DTO Rules

All external communication must occur through DTOs.

Never expose JPA entities directly.

Use dedicated DTOs for:

* Create requests.
* Update requests.
* Search filters.
* API responses.

Prefer Java Records for DTOs.

Example:

```java
public record TaskResponse(
    Long id,
    String title,
    String status
) {}
```

Benefits:

* Stable API contracts.
* Better security.
* Easier evolution.
* Better separation between persistence and presentation.

---

# Mapping Rules

Use explicit mapping between entities and DTOs.

Prefer dedicated mapper classes.

Examples:

```text
TaskMapper
UserMapper
FeatureMapper
```

Avoid duplicating mapping logic throughout controllers and services.

---

# Validation Rules

All incoming data must be validated.

Use Bean Validation whenever possible.

Examples:

```java
@NotBlank
@NotNull
@Email
@Size
@Positive
```

Validate as early as possible.

Never rely solely on frontend validation.

---

# Transaction Rules

Business operations that modify data should be transactional.

Use:

```java
@Transactional
```

at service level when appropriate.

Avoid transactional logic inside controllers.

---

# Persistence Rules

Before modifying persistence:

1. Review database-model.md.
2. Evaluate migration impact.
3. Create Flyway migrations when required.

Never:

* Modify production schema manually.
* Change executed migrations.
* Remove structures without impact analysis.

---

# JPA Rules

Always evaluate:

* Lazy loading.
* Eager loading.
* N+1 query risks.

Before adding relationships, evaluate performance implications.

Avoid:

```java
@OneToMany(fetch = FetchType.EAGER)
```

unless explicitly justified.

---

# Business Logic Rules

Business logic belongs in services.

Avoid placing business rules inside:

* Controllers.
* Repositories.
* DTOs.

Repositories should focus on:

* Persistence.
* Querying.
* Filtering.

Do not implement business workflows inside repository queries.

---

# Pagination Rules

Endpoints returning collections should support pagination whenever the dataset can grow significantly.

Prefer:

```text
GET /api/tasks?page=0&size=20
```

over returning unlimited records.

---

# Ownership and Authorization Rules

Always validate resource ownership when applicable.

Example:

```text
Users can only access their own tasks.
```

Review:

* Authentication.
* Authorization.
* Ownership validation.
* Role validation.

Never assume frontend restrictions are sufficient.

---

# Error Handling Rules

Use centralized exception handling.

Prefer:

* Domain-specific exceptions.
* ProblemDetail responses.
* Consistent API contracts.

Avoid:

* Generic RuntimeException.
* Silent failures.
* Empty catch blocks.

Never expose technical errors directly to API consumers.

---

# Logging Rules

Log meaningful business and technical events.

Examples:

* Login failed.
* Task created.
* Access denied.
* Feature updated.

Never log:

* Passwords.
* JWT tokens.
* Secrets.
* Sensitive personal information.

Logs must help diagnose problems without leaking confidential data.

---

# Documentation Rules

Public classes should contain JavaDoc explaining their purpose.

Public methods should contain JavaDoc describing:

* Purpose.
* Parameters.
* Return value.
* Important business considerations.

Complex business logic should contain explanatory comments.

Avoid comments that merely repeat what the code already says.

Code should explain "what".

Comments should explain "why".

---

# Dependency Management Rules

Before introducing a new dependency:

1. Verify the functionality does not already exist.
2. Justify the dependency.
3. Evaluate maintenance impact.
4. Prefer standard Spring Boot capabilities.

Avoid unnecessary libraries.

Keep the dependency tree lean.

---

# Security Rules

Always assume external input is untrusted.

Review:

* Authentication.
* Authorization.
* Ownership validation.
* Input validation.

Never:

* Hardcode credentials.
* Disable security to bypass issues.
* Expose sensitive information.

Passwords must always be stored as secure hashes.

---

# Testing Rules

Every backend change must be evaluated for test impact.

When production code is added or modified:

* Create new tests if none exist.
* Update existing tests if behaviour changes.
* Fix broken tests caused by the change.
* Keep all tests passing.

JUnit 5 is the official testing framework.

At minimum test:

* Service layer business logic.
* Domain rules.
* Validation rules.
* Security-sensitive logic.

If a bug is fixed:

1. Create a test that reproduces the bug.
2. Verify the test fails before the fix.
3. Verify the test passes after the fix.

Code changes are not considered complete until tests have been created or updated accordingly.

---

# Code Quality Rules

Prioritize:

* Readability.
* Simplicity.
* Maintainability.
* Consistency.

Prefer:

* Small classes.
* Small methods.
* Clear naming.
* Explicit logic.

Avoid:

* Overengineering.
* Premature optimization.
* Duplicate code.
* Deep nesting.

---

# Pull Request Checklist

Before considering a task complete:

* Architecture respected.
* DTOs used.
* Validation implemented.
* Security reviewed.
* Ownership reviewed.
* Migrations reviewed.
* Tests created or updated.
* Documentation updated if required.
* No duplicated code introduced.
* No unnecessary dependencies introduced.

The goal is not only to make the code work.

The goal is to keep the backend maintainable, secure, scalable and consistent with the project's architecture.
