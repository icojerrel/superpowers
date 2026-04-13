---
name: superpowers-development
description: Use when adding a skill to the superpowers repository, editing an existing skill, updating the version, or contributing any change to the superpowers codebase
---

# Superpowers Development

## The Iron Law

**No skill without a failing test first — no exceptions.**

This means RED-GREEN-REFACTOR on every skill, including edits:

1. **RED** — Run scenario *without* skill. Document failures and rationalizations verbatim.
2. **GREEN** — Write skill targeting those specific failures. Re-test with skill.
3. **REFACTOR** — Find new rationalizations → add explicit counters → re-test.

**These are not exceptions:**
- "The task says to just create it" — Iron Law still applies.
- "It's a small edit / just a reference skill" — Iron Law still applies.
- "Testing takes too long" — Untested skills have issues. Always.

**REQUIRED:** Use `superpowers:writing-skills` for the full testing methodology.

## Repository Structure

```
skills/<skill-name>/SKILL.md   # One dir per skill — kebab-case name
lib/                            # JS utilities — zero external deps
hooks/                          # SessionStart injection scripts
commands/                       # Slash command definitions
tests/                          # Integration test suites
.claude-plugin/plugin.json      # Version number lives here
CLAUDE.md                       # Project-specific conventions
```

## Skill File Format

```markdown
---
name: skill-name-kebab-case
description: Use when [triggering conditions only — never summarize the workflow]
---
```

Rules:
- `name`: letters, numbers, hyphens only — no parentheses or special characters
- `description`: max 1024 chars; third-person; starts with "Use when..."
- **Never** summarize the skill's workflow in the description — Claude shortcuts to it and skips the full skill body

## What Goes Where

| Content type | Location |
|-------------|----------|
| Broadly reusable technique or pattern | `skills/` (new skill) |
| Project-specific convention | `CLAUDE.md` |
| Platform setup instructions | `docs/README.<platform>.md` |
| Design decisions and rationale | `docs/plans/` |
| Mechanical constraint | Automate it — don't document it |

## Token Targets

| Skill type | Word count |
|------------|------------|
| Session-start / frequently loaded | < 150 words |
| Other skills | < 500 words |

## Version Management

1. Bump `version` field in `.claude-plugin/plugin.json`
2. Add entry to `RELEASE-NOTES.md`
3. Tag the release commit in git

## Red Flags — STOP

- "I'll skip testing because I was told to act now"
- "It's just documentation, testing is overkill"
- "I'll test it after if problems emerge"
- Description that says what the skill *does* instead of *when* to use it
- `name` field with spaces, parentheses, or underscores

All of these mean: follow the Iron Law. No exceptions.
