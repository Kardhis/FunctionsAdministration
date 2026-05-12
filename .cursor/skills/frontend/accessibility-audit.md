# Accessibility Audit

When auditing accessibility:

## 1. Semantic HTML

Review:
- headings
- sections
- forms
- buttons
- links
- tables
- landmarks

Prefer semantic elements over generic `div`/`span`.

## 2. Keyboard access

Verify:
- all controls are reachable by keyboard
- focus order is logical
- visible focus is preserved
- modals trap focus when appropriate
- escape closes dismissible dialogs when appropriate

## 3. Forms

Check:
- every input has a label
- validation messages are understandable
- required fields are clear
- errors are associated with fields where possible
- disabled states are understandable

## 4. Buttons and links

Use:
- `button` for actions
- `a` for navigation

Avoid clickable `div`s.

## 5. Color and contrast

Check:
- text contrast
- disabled states
- error states
- success states
- focus states

Do not rely only on color to communicate meaning.

## 6. Images and icons

Check:
- meaningful images have alt text
- decorative images are hidden from screen readers
- icon-only buttons have accessible names

## 7. Tables

Check:
- headers are defined
- data relationships are clear
- captions are used when helpful

## 8. Final report

Return:
- critical accessibility blockers
- important improvements
- affected components
- suggested fixes