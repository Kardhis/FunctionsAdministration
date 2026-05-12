# SQL Query Review

When reviewing SQL or JPQL queries:

## 1. Correctness

Check:
- joins are correct
- filters match business rules
- null handling is intentional
- grouping is correct
- sorting is deterministic
- pagination is safe

## 2. Performance

Review:
- missing indexes
- full table scans
- inefficient joins
- unnecessary subqueries
- unbounded result sets
- N+1 query risks

## 3. Security

Ensure:
- no string concatenation with user input
- parameters are bound safely
- no SQL injection risks
- sensitive data is not returned unnecessarily

## 4. Maintainability

Prefer:
- readable query structure
- clear aliases
- simple joins
- explicit selected columns when appropriate

Avoid:
- overly clever queries
- hidden business logic
- duplicated query fragments

## 5. JPA-specific review

Check:
- lazy loading risks
- fetch joins
- projections
- entity graphs
- pagination with fetch joins
- transaction boundaries

## 6. Final report

Return:
- correctness issues
- performance risks
- security risks
- recommended indexes
- suggested rewrite if needed