# Database Performance Review

When reviewing database performance:

## 1. Query patterns

Identify:
- most frequent queries
- slow queries
- large result sets
- expensive joins
- N+1 patterns
- missing pagination

## 2. Indexes

Review indexes for:
- foreign keys
- filters
- sorting
- unique lookups
- join columns

Avoid:
- redundant indexes
- unused indexes
- indexing every column blindly

## 3. Schema

Check:
- data types
- normalization
- denormalization tradeoffs
- table growth
- audit/history tables

## 4. JPA/Hibernate

Review:
- lazy loading
- eager loading
- fetch joins
- projections
- pagination
- transaction scope
- batch operations

## 5. Writes

Check:
- transaction size
- locking risks
- duplicate updates
- cascade behavior
- bulk operations

## 6. Final report

Return:
- critical bottlenecks
- missing indexes
- risky queries
- JPA risks
- recommended measurements