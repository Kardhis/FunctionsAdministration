# Migration Review

When reviewing database migrations:

## 1. Safety

Check:
- migration is reversible when possible
- destructive changes are explicit
- existing data is preserved
- default values are safe
- nullability changes are safe

## 2. Compatibility

Verify:
- application code matches schema changes
- old code will not break during deployment
- deployment order is safe
- rollback strategy is considered

## 3. Data integrity

Check:
- foreign keys
- unique constraints
- not-null constraints
- indexes
- data backfills

## 4. Performance

Review:
- long-running migrations
- table locks
- large table alterations
- index creation cost

## 5. Naming

Ensure:
- table names are consistent
- column names are consistent
- constraint names are understandable
- index names are clear

## 6. Final report

Return:
- migration risks
- required code changes
- rollback concerns
- deployment order
- suggested improvements