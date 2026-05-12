# Frontend Component Design

When designing frontend components:

## 1. Component purpose

Each component must have a clear responsibility.

Avoid components that combine:
- data fetching
- business rules
- layout
- styling
- forms
- modals
- tables
all at once.

## 2. Component types

Prefer separating:
- page components
- layout components
- feature components
- reusable UI components
- form components
- table/list components

## 3. Props

Props should be:
- explicit
- minimal
- predictable
- well named

Avoid:
- boolean explosion
- unclear generic prop names
- passing huge objects unnecessarily
- hidden side effects

## 4. State

Use local state for local behavior.

Extract custom hooks when:
- logic is reused
- logic becomes complex
- async behavior needs isolation
- component readability suffers

## 5. Composition

Prefer composition over overly configurable components.

Good:
- small components combined clearly

Bad:
- one generic component with too many modes

## 6. Testability

Design components so they can be tested through:
- visible text
- accessible roles
- labels
- stable IDs when necessary

## 7. Final checklist

Before finalizing a component:
- name is clear
- responsibility is focused
- props are understandable
- state is minimal
- accessibility is considered
- responsive behavior is handled
- component can be tested