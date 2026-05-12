# Frontend Performance Audit

When auditing frontend performance:

## 1. Rendering

Review:
- unnecessary re-renders
- excessive state updates
- expensive calculations during render
- large components doing too much work
- unstable props causing child re-renders

Prefer:
- simpler component boundaries
- derived values only when needed
- memoization only when it solves a real issue

## 2. Bundle size

Check:
- unnecessary dependencies
- oversized imports
- unused code
- duplicated libraries
- heavy UI/icon/chart libraries

Prefer:
- route-level lazy loading
- tree-shakeable imports
- lightweight alternatives when reasonable

## 3. Assets

Review:
- image sizes
- image formats
- unused assets
- large fonts
- unoptimized icons

Prefer:
- compressed images
- responsive images
- SVGs for simple icons
- lazy loading non-critical images

## 4. Network

Review:
- duplicate API calls
- unbounded requests
- missing loading states
- requests triggered too often
- waterfall requests that could be parallelized

Prefer:
- centralized API logic
- caching where appropriate
- pagination for large lists
- debouncing search/filter inputs

## 5. UX performance

Check:
- layout shifts
- slow interactions
- blocked UI during async work
- missing skeleton/loading feedback

## 6. Final report

Return:
- critical performance issues
- important improvements
- optional optimizations
- files affected
- suggested tests/checks