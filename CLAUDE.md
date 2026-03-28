# CLAUDE.md — Superpowers Repository Guide

## What This Repository Is

**Superpowers** is a composable "skills" framework for AI coding agents (Claude, Codex, OpenCode). Skills are structured markdown reference guides that teach agents proven development techniques and workflows. They auto-inject at session start via hooks, so agents follow them without explicit user instruction.

**Current version:** 4.0.3
**License:** MIT
**Maintainer:** Jesse Vincent

---

## Repository Structure

```
superpowers/
├── skills/                    # 16 core skills (the product)
├── lib/                       # JavaScript utilities (skill loading/validation)
├── hooks/                     # SessionStart hook scripts
├── commands/                  # Slash command definitions (/brainstorm, etc.)
├── agents/                    # Reusable agent templates
├── tests/                     # Integration test suites
├── docs/                      # Platform guides and design docs
├── .claude-plugin/            # Claude Code plugin metadata
├── .codex/                    # Codex platform support
├── .opencode/                 # OpenCode platform support
├── README.md                  # User-facing documentation
├── RELEASE-NOTES.md           # Version history
└── plugin.json                # Plugin metadata (version, description)
```

### The 16 Skills

Each skill lives in `skills/<skill-name>/SKILL.md`:

| Skill | Purpose |
|-------|---------|
| `using-superpowers` | Foundation — how to find and use skills |
| `brainstorming` | Socratic design refinement before coding |
| `writing-plans` | Create detailed implementation plans from specs |
| `executing-plans` | Batch execution with human checkpoints |
| `subagent-driven-development` | Independent subagent tasks with two-stage review |
| `super-developer-mode` | Complex parallel execution coordination |
| `test-driven-development` | RED-GREEN-REFACTOR cycle enforcement |
| `systematic-debugging` | Root-cause investigation before fixes |
| `verification-before-completion` | Evidence-based task completion |
| `dispatching-parallel-agents` | Concurrent subagent workflows |
| `requesting-code-review` | Pre-review verification checklist |
| `receiving-code-review` | Feedback response protocol |
| `using-git-worktrees` | Isolated workspace creation and management |
| `finishing-a-development-branch` | Merge/PR decision workflow |
| `skills-enhancement` | Skill quality analysis and improvement |
| `writing-skills` | TDD-based skill creation framework |

---

## Development Conventions

### Skill File Format

Every skill **must** have a `SKILL.md` with YAML frontmatter:

```markdown
---
name: skill-name-in-kebab-case
description: Use when [specific triggering conditions and symptoms]
---

# Skill Title
...
```

**Frontmatter rules:**
- Only two fields: `name` and `description`
- `name`: letters, numbers, hyphens only — no parentheses or special chars
- `description`: max 1024 chars total; start with "Use when..."; third-person; describe **triggering conditions only** — never summarize the skill's workflow (Claude may shortcut to the description instead of reading the full skill)
- Keep descriptions under 500 chars if possible

### Naming Conventions

- Skills: `kebab-case` directories matching the skill name exactly
- Files: descriptive, hyphen-separated (e.g., `testing-anti-patterns.md`)
- Git commits: conventional prefix (`feat:`, `fix:`, `docs:`) or `Release vX.Y.Z` / `Bump version to X.Y.Z`

### Skill Directory Layout

```
skills/
  skill-name/
    SKILL.md              # Required — main reference
    supporting-file.*     # Only if needed for heavy reference (100+ lines) or reusable tools
```

Keep code examples inline if under ~50 lines. Use separate files only for heavy API references or reusable scripts.

### JavaScript Utilities (`lib/`)

Three utility modules with **zero external dependencies**:

- `lib/skills-core.js` — skill discovery, frontmatter parsing, shadowing, update checking
- `lib/skills-validator.js` — format validation (kebab-case, required fields, content checks)
- `lib/skills-stats.js` — statistics and reporting

Use CommonJS `require`/`module.exports`. No npm packages. Keep modules pure-functional.

---

## Creating or Editing Skills

**The Iron Law: No skill without a failing test first.**

Follow the RED-GREEN-REFACTOR cycle (same as TDD, applied to documentation):

1. **RED** — Run a pressure scenario *without* the skill. Document exact agent behavior and rationalizations verbatim.
2. **GREEN** — Write the skill targeting those specific failures. Run same scenarios *with* skill; verify compliance.
3. **REFACTOR** — Find new rationalizations → add explicit counters → re-test until bulletproof.

This applies to new skills **and** edits to existing skills. No exceptions.

### Claude Search Optimization (CSO)

Since Claude searches skill descriptions to decide what to load:

- Start description with `"Use when..."` — focus on triggering conditions, not workflow
- Include concrete symptoms, error messages, and synonyms as keywords
- Never summarize the process/workflow in the description (Claude will shortcut to it)
- Name skills by what you *do*, verb-first: `condition-based-waiting` not `async-test-helpers`

### Token Efficiency Targets

| Skill type | Word count target |
|------------|------------------|
| Getting-started / frequently loaded | < 150 words each |
| Other frequently-loaded skills | < 200 words total |
| Other skills | < 500 words |

---

## Testing

Tests live in `tests/` and use the Claude Code CLI in headless mode (`claude -p`).

```bash
# From tests/claude-code/
./run-skill-tests.sh                    # All fast tests
./run-skill-tests.sh --integration      # Integration tests (slow, 10-30 min)
./run-skill-tests.sh --verbose          # Full output
./run-skill-tests.sh --timeout 1800     # Custom timeout (seconds)
```

Test suites:

| Suite | What it validates |
|-------|-----------------|
| `tests/claude-code/` | Skill loading, workflow ordering, requirements |
| `tests/explicit-skill-requests/` | Skills invoked when requested by name |
| `tests/skill-triggering/` | Skills trigger from naive prompts without explicit naming |
| `tests/subagent-driven-dev/` | Parallel subagent dispatch and aggregation |
| `tests/opencode/` | OpenCode platform integration |

Token cost analysis: `tests/claude-code/analyze-token-usage.py` parses JSONL session transcripts.

There is **no CI/CD pipeline** — tests run locally via the Claude Code CLI. No GitHub Actions workflows exist.

---

## Version Management

- Version lives in `.claude-plugin/plugin.json` (`version` field)
- Follow semantic versioning
- Update `RELEASE-NOTES.md` for every release
- Tag releases in git

---

## Platform Support

| Platform | Installation method |
|----------|-------------------|
| Claude Code | `/plugin marketplace add obra/superpowers-marketplace` then `/plugin install superpowers@superpowers-marketplace` |
| Codex | Fetch and follow `.codex/INSTALL.md` |
| OpenCode | Fetch and follow `.opencode/INSTALL.md` |

The `hooks/session-start.sh` script auto-injects the `using-superpowers` skill at session start for Claude Code. Windows uses `hooks/run-hook.cmd`.

---

## What Belongs Where

| Content type | Location |
|-------------|----------|
| Broadly reusable technique, pattern, or reference | `skills/` (new skill) |
| Project-specific conventions | `CLAUDE.md` (this file) |
| Platform setup instructions | `docs/README.<platform>.md` |
| Design decisions and rationale | `docs/plans/` |
| Mechanical constraints (enforceable with regex/validation) | Automate it — don't document it |

**Do not create skills for:** one-off solutions, standard practices documented elsewhere, or project-specific conventions.

---

## Development Branch

Active feature development happens on `claude/add-claude-documentation-bWJlI`. The stable branch is `main`.

When pushing:
```bash
git push -u origin <branch-name>
```
