# Claude Code Notes

## Workflow

- Always start by checking the documentation before implementing or testing.
  - Make sure to pay special attention to styleguides relevant for each task.
    - It is important to keep tests consistent, so follow the test styleguide to the T.
- Do only what is explicitly asked.
  - Don't decide to also update code to align with documentation changes. Don't prompt the user for things that they did
    not ask, make a comment instead.
  - Never ask to run commands unless explicitly stated. State the command and its purpose, and the user will run it
    themselves.
- When editing documentation, don't condense or summarize what's already there. Add to it without losing existing
  detail.
  - Don't remove or rephrase parenthetical comments. They're there for a reason.
- When adding new documentation, carefully capture the user's explanation. Don't over-simplify it.
- When adding new documentation, use real life examples found in the codebase and simplify them.
