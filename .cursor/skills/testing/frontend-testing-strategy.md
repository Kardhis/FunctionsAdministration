# Frontend Testing Strategy

When testing frontend code:

## Test user behavior

Prefer testing what the user sees and does.

Focus on:
- rendering
- form input
- validation messages
- loading states
- error states
- navigation
- protected routes

## Selectors

Prefer:
- accessible roles
- labels
- text visible to the user

Avoid:
- brittle CSS selectors
- implementation-specific selectors

## API mocking

Mock API calls at the boundary.

Test:
- success responses
- validation errors
- unauthorized responses
- network failures
- empty states

## Forms

For forms, test:
- initial state
- invalid input
- valid submission
- duplicate submission prevention
- loading state
- error rendering

## Authentication UI

Test:
- login success
- login failure
- logout
- unauthorized redirect
- protected route behavior