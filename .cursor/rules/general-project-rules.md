---
description: Global engineering standards, development workflow and project-wide architectural principles.
alwaysApply: true
---

# General Project Rules

Before implementing any change:

1. Read the relevant documentation.
2. Understand the business context.
3. Analyze the impact.
4. Propose a solution.
5. Implement only after understanding the existing architecture.

Always:

- Respect architecture-overview.md
- Respect database-model.md
- Respect deployment-guide.md

Never:

- Introduce breaking changes without justification.
- Modify unrelated code.
- Duplicate existing functionality.
- Ignore existing patterns.


Documentation is the source of truth.

When documentation and code disagree:

1. Report the inconsistency.
2. Do not assume documentation is outdated.
3. Ask for clarification or propose an update.

Never silently ignore documented standards.

When architecture, functionality and security conflict,
security requirements take precedence.
