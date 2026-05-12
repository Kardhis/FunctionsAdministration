# Test Driven Development Workflow

When using TDD:

## 1. Red

Write a failing test first.

The test should express the desired behavior clearly.

## 2. Green

Implement the minimum production code needed to pass the test.

Avoid overengineering.

## 3. Refactor

Improve structure without changing behavior.

Ensure tests remain green.

## Test quality

Tests should be:
- readable
- deterministic
- isolated when possible
- focused on behavior
- resistant to harmless implementation changes

## Naming

Use descriptive test names.

Example:
- `shouldCreateHabitWhenRequestIsValid`
- `shouldReturnConflictWhenHabitAlreadyExists`
- `shouldRejectLoginWithInvalidCredentials`

## Coverage focus

Prioritize:
- business rules
- security rules
- validation
- error handling
- edge cases
- integration boundaries

Do not chase meaningless coverage.