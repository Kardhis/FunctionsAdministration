# Fullstack Feature Implementation

When implementing a new feature:

## Phase 1 — Understand the feature

Before coding:
- Identify business requirements.
- Identify frontend impact.
- Identify backend impact.
- Identify database impact.
- Identify authentication/authorization impact.
- Identify testing impact.
- Identify deployment/configuration impact.

Ask:
- What problem is being solved?
- What are the edge cases?
- What can fail?
- What should happen on success?
- What should happen on error?

---

## Phase 2 — Design before implementation

Before writing code:
- Propose architecture.
- Identify affected files.
- Identify reusable abstractions.
- Avoid duplication.
- Respect existing project conventions.

Prefer:
- cohesive changes
- reusable patterns
- maintainable architecture

Avoid:
- hacks
- duplicated logic
- tightly coupled implementations

---

## Phase 3 — Backend-first reasoning

For fullstack features:
1. Design database model.
2. Design API contract.
3. Design validation rules.
4. Design authorization rules.
5. Design error handling.
6. Then implement frontend.

Frontend should consume a clean API contract.

---

## Phase 4 — Error handling

Every feature must define:
- loading state
- empty state
- validation state
- unauthorized state
- server error state
- network failure state

---

## Phase 5 — Security review

Always verify:
- authentication
- authorization
- validation
- sensitive data exposure
- insecure frontend assumptions

---

## Phase 6 — Testing review

Identify:
- unit tests
- integration tests
- edge cases
- regression risks

---

## Phase 7 — Final review

Before finalizing:
- remove dead/debug code
- review naming
- review responsiveness
- review accessibility
- review performance impact
- review maintainability