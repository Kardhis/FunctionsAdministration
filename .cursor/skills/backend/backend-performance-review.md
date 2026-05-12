# Backend Performance Review

When reviewing backend performance:

## 1. Request flow

Analyze:
- controller logic
- service logic
- repository calls
- external calls
- serialization cost
- transaction boundaries

## 2. Database usage

Check:
- N+1 queries
- unnecessary queries
- missing pagination
- large response payloads
- inefficient filtering in memory
- missing indexes

## 3. Transactions

Review:
- transaction length
- write contention
- unnecessary write transactions
- remote calls inside transactions

## 4. Memory and CPU

Check:
- loading large collections
- processing too much in memory
- inefficient loops
- repeated calculations
- large DTO mapping costs

## 5. API design

Review:
- unbounded endpoints
- excessive payloads
- missing pagination
- inefficient search endpoints
- chatty frontend-backend communication

## 6. Caching

Consider caching only when:
- data is read frequently
- data changes infrequently
- invalidation is clear

Avoid premature caching.

## 7. Final report

Return:
- bottlenecks
- affected endpoints
- database risks
- code-level improvements
- measurement recommendations