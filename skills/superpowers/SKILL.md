---
name: superpowers
description: Use when a user wants an overview of all available skills and how to use them - shows the complete skill catalog with descriptions and usage guidance
---

# Superpowers Skills Overview

You have superpowers — a complete software development workflow built from composable skills.

## How to Use Skills

Invoke skills with the `Skill` tool **before any response or action** when a skill might apply. Even a 1% chance means you should invoke it.

```
Skill("brainstorming")       # Before any feature work
Skill("systematic-debugging") # Before any bugfix
Skill("test-driven-development") # Before writing implementation code
```

## Available Skills

### Planning & Design

| Skill | When to Use |
|-------|-------------|
| `brainstorming` | **Before any creative work** - features, components, new functionality. Explores intent and design before code. |
| `writing-plans` | When you have requirements for a multi-step task - creates implementation plans with bite-sized tasks. |

### Implementation & Execution

| Skill | When to Use |
|-------|-------------|
| `test-driven-development` | Before writing any implementation code - enforces RED-GREEN-REFACTOR cycle. |
| `executing-plans` | When you have a written plan to execute in a separate session with review checkpoints. |
| `subagent-driven-development` | When executing implementation plans with independent tasks in the current session. |
| `super-developer-mode` | For complex plans with multiple independent tasks - parallel subagents + two-stage review. |
| `dispatching-parallel-agents` | When facing 2+ independent tasks that can run without shared state or sequential dependencies. |

### Debugging

| Skill | When to Use |
|-------|-------------|
| `systematic-debugging` | **Before proposing any fix** - when encountering bugs, test failures, or unexpected behavior. |

### Code Quality & Review

| Skill | When to Use |
|-------|-------------|
| `requesting-code-review` | When completing tasks or before merging - verifies work meets requirements. |
| `receiving-code-review` | Before implementing review suggestions - requires technical rigor, not blind agreement. |
| `verification-before-completion` | **Before claiming work is done** - run verification commands, evidence before assertions. |

### Git & Branches

| Skill | When to Use |
|-------|-------------|
| `using-git-worktrees` | Before feature work needing isolation, or before executing implementation plans. |
| `finishing-a-development-branch` | When implementation is complete and tests pass - guides merge/PR/cleanup options. |

### Skills Management

| Skill | When to Use |
|-------|-------------|
| `writing-skills` | When creating or editing skills - applies TDD to process documentation. |
| `skills-enhancement` | When analyzing, validating, or improving existing skills. |
| `using-superpowers` | Agent onboarding - establishes the rule that skills must be invoked before any action. |

## Typical Workflows

**Building a new feature:**
1. `brainstorming` → explore requirements
2. `writing-plans` → create implementation plan
3. `test-driven-development` → implement with TDD
4. `verification-before-completion` → verify before claiming done
5. `requesting-code-review` → get review
6. `finishing-a-development-branch` → merge/PR

**Fixing a bug:**
1. `systematic-debugging` → diagnose root cause
2. `test-driven-development` → write failing test, then fix
3. `verification-before-completion` → verify fix

**Large parallel implementation:**
1. `brainstorming` + `writing-plans` → spec and plan
2. `super-developer-mode` → parallel execution with review

## Slash Commands

| Command | What it does |
|---------|-------------|
| `/brainstorm` | Invoke the brainstorming skill |
| `/write-plan` | Invoke the writing-plans skill |
| `/execute-plan` | Invoke the executing-plans skill |
| `/superpowers` | Show this overview |
