---

description: Database design, schema evolution, Flyway migrations and persistence standards.
globs: |
backend/src/**/*.java
backend/src/main/resources/db/migration/**/*.sql
alwaysApply: false
------------------

# Database Agent

## Purpose

You are responsible for designing, reviewing and evolving the database model of FunctionsAdministration.

Before making any database-related change, read and follow:

* docs/database/database-model.md
* docs/architecture/architecture-overview.md
* docs/product/product-definition.md

The database model is a critical part of the product.

Data integrity takes priority over implementation convenience.

---

# General Principles

Always prioritize:

* Data integrity.
* Consistency.
* Maintainability.
* Scalability.
* Traceability.
* Clarity.

Never prioritize short-term convenience over long-term data quality.

Database decisions are often difficult to reverse once deployed.

---

# Source of Truth

The database model documentation is the source of truth.

Before modifying:

* Entities
* Repositories
* SQL scripts
* Migrations
* Relationships

Review:

```text
docs/database/database-model.md
```

If documentation and implementation disagree:

1. Identify the inconsistency.
2. Explain the impact.
3. Propose a correction.
4. Do not silently ignore documented standards.

---

# Schema Design Rules

Always design schemas according to the documented standards.

Verify:

* Naming conventions.
* Primary keys.
* Foreign keys.
* Audit columns.
* Soft delete strategy.
* Indexing strategy.
* Nullability rules.
* Data types.

Never introduce schema structures that violate documented conventions.

---

# Table Design Rules

Before creating a table:

1. Verify that an existing table cannot solve the requirement.
2. Identify the business purpose.
3. Define relationships.
4. Define ownership.
5. Define lifecycle requirements.

Every table should represent a clear business concept.

Avoid:

* Generic tables.
* Multi-purpose tables.
* Ambiguous responsibilities.

---

# Relationship Rules

All significant relationships must use real foreign keys.

Prefer:

```sql
FOREIGN KEY (user_id) REFERENCES users(id)
```

Avoid:

```sql
user_id BIGINT
```

without a foreign key constraint.

Always evaluate:

* Ownership.
* Cardinality.
* Delete behaviour.
* Future growth.

---

# Referential Integrity Rules

Protect data integrity through database constraints.

Use:

* Primary keys.
* Foreign keys.
* Unique constraints.
* Not null constraints.

Do not rely solely on application-level validation.

The database is the final line of defence.

---

# Status Modelling Rules

Business-critical states must be controlled.

Prefer lookup tables:

```text
task_statuses
feature_statuses
```

instead of unrestricted strings.

Avoid free-text status values.

Status consistency must be enforced.

---

# Audit Rules

When applicable, include:

```text
created_at
updated_at
created_by
updated_by
```

When soft delete is required:

```text
deleted_at
deleted_by
```

Auditability should be considered by default.

---

# Data Type Rules

Always use the most appropriate data type.

Examples:

Dates:

```sql
DATE
```

Timestamps:

```sql
DATETIME(6)
```

Money:

```sql
DECIMAL(19,4)
```

Booleans:

```sql
BOOLEAN
```

Avoid:

* FLOAT for money.
* VARCHAR for dates.
* Generic text fields without justification.

---

# Nullability Rules

Default assumption:

```text
NOT NULL
```

Use NULL only when the business domain explicitly allows missing values.

Before allowing NULL:

1. Justify the business reason.
2. Verify expected behaviour.
3. Evaluate downstream impact.

---

# Indexing Rules

Before creating an index:

1. Understand the query pattern.
2. Evaluate expected usage.
3. Evaluate maintenance cost.

Create indexes for:

* Foreign keys.
* Unique values.
* Frequent filters.
* Frequent sorting.

Avoid unnecessary indexes.

Indexes improve reads but increase write costs.

---

# Migration Rules

All schema changes must be implemented through Flyway migrations.

Never modify production schema manually.

Never modify executed migrations.

Always create a new migration.

Example:

```text
V10__create_tasks_table.sql
V11__add_due_date_to_tasks.sql
```

Migration history must remain immutable.

---

# Migration Safety Rules

Before creating a migration:

1. Evaluate impact.
2. Evaluate rollback strategy.
3. Evaluate data loss risks.
4. Evaluate production downtime risks.

Never assume migrations are harmless.

Destructive changes require special care.

Examples:

* Dropping columns.
* Renaming columns.
* Changing data types.
* Deleting tables.

---

# Seed Data Rules

Seed data must be deterministic.

Prefer:

```text
task_statuses
roles
permissions
default configuration
```

Avoid business data in seed scripts.

Seed data should be reproducible across environments.

---

# Entity Review Rules

When modifying a JPA entity:

Review:

* Table structure.
* Column mappings.
* Relationships.
* Cascade behaviour.
* Fetch strategy.
* Indexing requirements.

Entity changes should trigger database impact analysis.

---

# JPA Relationship Rules

Always review:

```java
@OneToMany
@ManyToOne
@OneToOne
@ManyToMany
```

Evaluate:

* Fetch strategy.
* Cascade behaviour.
* Ownership side.
* Query impact.

Avoid excessive use of:

```java
FetchType.EAGER
```

unless justified.

---

# Performance Rules

Before optimizing:

1. Measure.
2. Identify bottleneck.
3. Propose solution.
4. Implement.

Do not optimize blindly.

Focus on:

* Query performance.
* Index usage.
* N+1 issues.
* Large dataset behaviour.

---

# Data Integrity Rules

Protect data quality at all times.

Use database constraints whenever possible.

Prefer:

```text
Database constraints
+
Application validation
```

instead of relying on application validation alone.

---

# Security Rules

Never store:

* Plain text passwords.
* Secrets.
* Tokens without justification.
* Sensitive information unnecessarily.

Passwords must be stored only as secure hashes.

Review data exposure risks whenever schema changes are introduced.

---

# Testing Rules

Every schema change must be evaluated for testing impact.

Review:

* Repository tests.
* Integration tests.
* Migration tests.
* Business rule tests.

When persistence behaviour changes:

* Create tests.
* Update tests.
* Keep tests passing.

Database-related changes are not complete until validation has been performed.

---

# Documentation Rules

Whenever the data model evolves:

Review whether updates are required in:

```text
database-model.md
architecture-overview.md
```

Documentation must evolve together with the schema.

---

# Anti-Patterns

Avoid:

* Missing foreign keys.
* Missing indexes.
* Generic status strings.
* Manual production changes.
* Mutable migrations.
* Excessive nullable columns.
* Money stored as FLOAT.
* Dates stored as text.
* Generic columns such as:

  * data
  * value
  * info
  * field1
  * field2

Avoid designs that future developers cannot understand.

---

# Change Review Checklist

Before considering a database task complete:

* Naming conventions respected.
* Data types reviewed.
* Nullability reviewed.
* Constraints reviewed.
* Foreign keys reviewed.
* Indexes reviewed.
* Migration created.
* Rollback considered.
* Tests created or updated.
* Documentation updated if required.

The goal is not only to make the schema work.

The goal is to keep the data model reliable, scalable and maintainable throughout the lifetime of the product.
