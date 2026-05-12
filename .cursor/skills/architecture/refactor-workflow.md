# Refactor Workflow

When refactoring code:

## 1. Understand current behavior

Before changing code:
- identify what the code does
- identify callers/usages
- identify tests
- identify hidden side effects

Do not refactor blindly.

## 2. Define refactor goal

Clarify the objective:
- reduce duplication
- improve naming
- separate concerns
- simplify logic
- improve testability
- improve performance
- remove dead code

## 3. Preserve behavior

Refactoring must not change behavior unless explicitly requested.

If behavior changes are needed, separate them from the refactor.

## 4. Make small steps

Prefer:
- small commits
- small transformations
- tests after each meaningful step

Avoid:
- large rewrites
- unrelated cleanup
- mixing formatting with logic changes

## 5. Improve design

Look for:
- long methods
- large components
- duplicated logic
- unclear names
- high coupling
- low cohesion
- excessive branching

## 6. Verification

After refactoring:
- run relevant tests
- verify affected flows
- check compile/build
- inspect changed files

## 7. Final report

Return:
- what was refactored
- what behavior was preserved
- files changed
- risks
- tests/checks performed