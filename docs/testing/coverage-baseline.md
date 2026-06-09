# Coverage baseline

Captured at start of testing plan implementation (M0).

## Backend

- Test files: 6
- Test cases: 13
- Command: `cd backend && mvn test`
- Coverage command: `mvn verify` → `backend/target/site/jacoco/index.html`
- Estimated coverage before plan: &lt; 15%

## Frontend

- Test files: 2
- Test cases: 5
- Command: `cd frontend && npm test`
- Coverage command: `npm run test:coverage` → `frontend/coverage/index.html`
- Estimated coverage before plan: &lt; 5%

## Targets (testing-agent)

| Metric | Target |
|--------|--------|
| Global | ≥ 80% |
| Services | ≥ 90% |
| Security / auth | ≥ 90% |
| Validation | ≥ 90% |
