# Responsive UI Audit

When auditing responsive UI:

## 1. Viewports

Review the UI mentally for:
- mobile: 360px
- tablet: 768px
- desktop: 1024px+

## 2. Layout

Check:
- fixed widths
- overflowing containers
- broken grids
- unreadable columns
- elements too close together
- incorrect wrapping

Prefer:
- mobile-first layout
- flex/grid with wrapping
- relative units
- max-width containers
- readable spacing

## 3. Tables

For tables:
- verify mobile usability
- avoid invisible overflow
- consider card layout on mobile
- use horizontal scroll only when acceptable
- keep headers and content understandable

## 4. Forms

Check:
- input width
- label readability
- button placement
- error message layout
- keyboard usability on mobile

## 5. Navigation

Check:
- menu usability
- touch target size
- route accessibility
- header/footer behavior
- active state visibility

## 6. Visual quality

Verify:
- typography scales properly
- spacing feels balanced
- cards do not collapse badly
- no horizontal page scroll
- important actions remain visible

## 7. Final report

Return:
- responsive issues found
- affected screens/components
- recommended fixes
- risky areas to test manually