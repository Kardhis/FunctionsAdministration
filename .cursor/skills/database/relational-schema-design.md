# Relational Schema Design

When designing a relational schema:

## 1. Model the domain

Identify:
- main entities
- relationships
- ownership
- lifecycle
- invariants
- audit requirements

## 2. Tables

Tables should:
- represent clear domain concepts
- use consistent naming
- avoid duplicated data unless justified
- include appropriate primary keys

## 3. Columns

Columns should have:
- appropriate data types
- nullability defined intentionally
- defaults only when meaningful
- constraints where needed

## 4. Relationships

Define:
- one-to-one
- one-to-many
- many-to-many
- ownership rules
- cascade behavior carefully

Avoid dangerous cascades unless fully justified.

## 5. Constraints

Use:
- primary keys
- foreign keys
- unique constraints
- check constraints when supported
- not-null constraints

Protect business invariants at database level when possible.

## 6. Indexes

Add indexes for:
- foreign keys
- frequent filters
- frequent sorts
- unique lookups

Avoid over-indexing.

## 7. Audit fields

Consider:
- created_at
- updated_at
- created_by
- updated_by
- deleted_at for soft delete if needed

## 8. Final output

Return:
- proposed tables
- columns
- relationships
- constraints
- indexes
- risks or tradeoffs