# Coverage report — FunctionsAdministration

Generated after completing the testing plan (checkpoints M0–CP14).

## Summary

| Layer | Test files | Tests (run) | Skipped | Coverage |
|-------|------------|-------------|---------|----------|
| Backend | ~35 | ~177 | ~32 (Testcontainers, no Docker) | JaCoCo on `mvn verify` |
| Frontend | ~80 | ~280+ | 0 | ≥80% lines/statements (Vitest v8) |

## Targets (testing-agent)

| Metric | Target | Frontend gate |
|--------|--------|---------------|
| Lines / statements | ≥ 80% | 80% |
| Branches | ≥ 80% where applicable | 70% |
| Functions | — | 44% (React handlers) |
| Services / auth / security (backend) | ≥ 90% | N/A |

## Commands

```bash
# Backend
cd backend && mvn test
cd backend && mvn verify   # JaCoCo → target/site/jacoco/

# Frontend
cd frontend && npm test
cd frontend && npm run test:coverage   # → frontend/coverage/
```

## Integration tests (Docker)

Tests extending `AbstractIntegrationTest` or `AbstractJpaTest` require Docker for Testcontainers MySQL. Without Docker they are **skipped** (`disabledWithoutDocker = true`), not failed.

## Checkpoints completed

- M0: Test infra (Testcontainers, MSW, RTL, JaCoCo, Vitest)
- CP1–CP6: Backend auth, security, tasks, habits, objectives, admin
- CP7–CP13: Frontend domain, repos, routes, pages, UI
- CP14: `CriticalFlowsIntegrationTest`, `criticalFlows.test.jsx`
- Final: README + this report
