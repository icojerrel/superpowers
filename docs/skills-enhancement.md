# Skills Enhancement Utilities

## Overview

The Skills Enhancement utilities provide analysis and validation capabilities for Superpowers skills. These tools help you understand your skills' composition, identify gaps, and ensure quality standards.

**Utilities included:**
- **skills-stats.js** - Analyze skill composition and generate metrics
- **skills-validator.js** - Validate skill structure and content quality

These utilities are particularly useful when:
- Creating new skills to ensure they follow best practices
- Auditing existing skills for quality and completeness
- Generating reports on skill collection coverage
- Integrating with the `skills-enhancement` skill for automated analysis

---

## Installation

No installation required. These utilities are part of the Superpowers core library located at:

```
C:\Users\Gebruiker\Desktop\superpowers\lib\
├── skills-core.js         # Core skill operations
├── skills-stats.js        # Statistics and analysis
└── skills-validator.js    # Validation and quality checks
```

**Requirements:**
- Node.js v14 or higher (v18+ recommended for ES module support)
- Access to the Superpowers skills directory

---

## API Documentation

### lib/skills-stats.js

Provides statistical analysis and metrics for skills.

#### Functions

##### `getSkillsStats(skillsDir)`

Get comprehensive statistics about all skills in a directory.

**Parameters:**
- `skillsDir` (String) - Path to directory containing skills

**Returns:**
```javascript
{
  total: Number,              // Total number of skills found
  byCategory: Object,         // Skills grouped by category
  withDescription: Number,    // Skills with descriptions
  withoutDescription: Number, // Skills missing descriptions
  newest: {                   // Most recently modified skill
    name: String,
    description: String,
    category: String,
    modifiedAt: Date
  } | null,
  oldest: {                   // Least recently modified skill
    name: String,
    description: String,
    category: String,
    modifiedAt: Date
  } | null,
  skills: [                   // List of all skills
    {
      name: String,
      description: String,
      category: String
    }
  ]
}
```

**Example:**
```javascript
import { getSkillsStats } from './lib/skills-stats.js';

const stats = getSkillsStats('C:\\Users\\Gebruiker\\Desktop\\superpowers\\skills');

console.log(`Total skills: ${stats.total}`);
console.log(`With descriptions: ${stats.withDescription}`);
console.log(`Without descriptions: ${stats.withoutDescription}`);
console.log(`Categories: ${Object.keys(stats.byCategory).join(', ')}`);

if (stats.newest) {
  console.log(`Newest skill: ${stats.newest.name} (${stats.newest.modifiedAt})`);
}

if (stats.oldest) {
  console.log(`Oldest skill: ${stats.oldest.name} (${stats.oldest.modifiedAt})`);
}
```

---

### lib/skills-validator.js

Validates skill structure and content quality against best practices.

#### Functions

##### `validateSkill(skillPath)`

Validates a single skill file for structure, required fields, and common issues.

**Parameters:**
- `skillPath` (String) - Absolute path to skill directory or SKILL.md file

**Returns:**
```javascript
{
  valid: Boolean,           // Overall validation status
  errors: [String],         // Critical issues that must be fixed
  warnings: [String],       // Recommended improvements
  skillName: String         // Extracted skill name
}
```

**Validation Checks:**
1. **File exists** - SKILL.md file must be present and readable
2. **YAML frontmatter** - Valid YAML frontmatter with proper `---` delimiters
3. **Required fields** - `name` and `description` must be present
4. **Skill name format** - Must be in kebab-case (lowercase letters, numbers, hyphens)
5. **Description not empty** - Description must have content
6. **Content section** - Must have content after frontmatter

**Example:**
```javascript
import { validateSkill } from './lib/skills-validator.js';

const result = validateSkill(
  'C:\\Users\\Gebruiker\\Desktop\\superpowers\\skills\\test-driven-development'
);

if (!result.valid) {
  console.error('Validation failed:');
  result.errors.forEach(err => console.error(`  - ${err}`));
}

if (result.warnings.length > 0) {
  console.warn('Warnings:');
  result.warnings.forEach(warn => console.warn(`  - ${warn}`));
}

console.log(`Skill: ${result.skillName}`);
```

---

##### `validateAllSkills(skillsDir)`

Validates all skills in a directory and generates a summary report.

**Parameters:**
- `skillsDir` (String) - Path to skills directory

**Returns:**
```javascript
{
  valid: Boolean,           // Overall validation status
  results: [                // Individual skill results
    {
      skillName: String,
      skillPath: String,
      valid: Boolean,
      errors: [String],
      warnings: [String]
    }
  ]
}
```

**Example:**
```javascript
import { validateAllSkills } from './lib/skills-validator.js';

const report = validateAllSkills(
  'C:\\Users\\Gebruiker\\Desktop\\superpowers\\skills'
);

const valid = report.results.filter(r => r.valid).length;
const invalid = report.results.filter(r => !r.valid).length;

console.log(`Validated ${report.results.length} skills`);
console.log(`Valid: ${valid}, Invalid: ${invalid}`);

// Show details for invalid skills
report.results
  .filter(r => !r.valid)
  .forEach(r => {
    console.log(`\n${r.skillName}:`);
    r.errors.forEach(e => console.log(`  - ${e}`));
  });
```

---

##### `formatValidationResult(result, skillPath)`

Formats validation results as a human-readable string.

**Parameters:**
- `result` (Object) - Result from validateSkill()
- `skillPath` (String) - Path to the skill file

**Returns:** (String) - Formatted validation report

---

##### `formatBatchValidationResult(batchResult)`

Formats batch validation results as a human-readable string.

**Parameters:**
- `batchResult` (Object) - Result from validateAllSkills()

**Returns:** (String) - Formatted batch validation report

---

## Usage Examples

### Example 1: Basic Skill Analysis

```javascript
import { getSkillsStats } from './lib/skills-stats.js';

const stats = getSkillsStats('C:\\Users\\Gebruiker\\Desktop\\superpowers\\skills');

console.log('Skills Statistics:');
console.log(`  Total: ${stats.total}`);
console.log(`  With descriptions: ${stats.withDescription}`);
console.log(`  Without descriptions: ${stats.withoutDescription}`);
console.log(`\n  Categories:`);
Object.entries(stats.byCategory).forEach(([cat, count]) => {
  console.log(`    ${cat}: ${count}`);
});

if (stats.newest) {
  console.log(`\n  Newest: ${stats.newest.name} (${stats.newest.modifiedAt})`);
}
if (stats.oldest) {
  console.log(`  Oldest: ${stats.oldest.name} (${stats.oldest.modifiedAt})`);
}
```

### Example 2: Validate Before Publishing

```javascript
import { validateSkill, formatValidationResult } from './lib/skills-validator.js';

const result = validateSkill(
  'C:\\Users\\Gebruiker\\Desktop\\superpowers\\skills\\my-new-skill'
);

if (!result.valid) {
  console.error('Validation failed. Fix these issues:');
  result.errors.forEach(err => console.error(`  - ${err}`));
} else {
  console.log('✅ Skill is valid!');
}

if (result.warnings.length > 0) {
  console.warn('\nWarnings:');
  result.warnings.forEach(warn => console.warn(`  - ${warn}`));
}
```

### Example 3: Batch Validation Report

```javascript
import { validateAllSkills, formatBatchValidationResult } from './lib/skills-validator.js';

const report = validateAllSkills('C:\\Users\\Gebruiker\\Desktop\\superpowers\\skills');

console.log(formatBatchValidationResult(report));

// Or process programmatically:
const validCount = report.results.filter(r => r.valid).length;
const invalidCount = report.results.filter(r => !r.valid).length;

console.log(`\nSummary: ${validCount} valid, ${invalidCount} invalid`);

// Show only invalid skills
report.results
  .filter(r => !r.valid)
  .forEach(r => {
    console.log(`\n${r.skillName}:`);
    r.errors.forEach(e => console.log(`  - ${e}`));
  });
```

---

## Integration with Skills Enhancement Skill

These utilities are designed to work seamlessly with the `skills-enhancement` skill (coming soon). The skill will:

1. **Automated Analysis** - Run `validateAllSkills()` on skill creation
2. **Quality Gates** - Use `validateSkill()` before publishing
3. **Metrics Dashboard** - Display `getSkillsStats()` results
4. **Improvement Suggestions** - Show validation recommendations

---

## Example Output

### Statistics Output

```json
{
  "total": 20,
  "byCategory": {
    "testing": 3,
    "collaboration": 5,
    "meta": 4,
    "git": 2,
    "other": 6
  },
  "withDescription": 18,
  "withoutDescription": 2,
  "newest": {
    "name": "super-developer-mode",
    "description": "Use when executing complex implementation plans...",
    "category": "development",
    "modifiedAt": "2025-01-15T10:30:00.000Z"
  },
  "oldest": {
    "name": "using-git-worktrees",
    "description": "Use when working with multiple branches simultaneously...",
    "category": "git",
    "modifiedAt": "2024-06-01T14:20:00.000Z"
  }
}
```

### Validation Output

```
✓ VALID: test-driven-development (skills/test-driven-development/SKILL.md)
  All checks passed!

✗ INVALID: my-new-skill (skills/my-new-skill/SKILL.md)

Errors:
  • Missing required field: `description`
  • No content found after frontmatter. Skill files must have a content section.
```

---

## Best Practices

1. **Run validation before committing** - Catch issues early
2. **Check related skills** - Avoid duplication and fill gaps
3. **Monitor quality scores** - Aim for 80+ on all skills
4. **Review common errors** - Fix systemic issues across skills
5. **Update metrics regularly** - Track skill collection growth

---

## Troubleshooting

### Skill Not Found
**Problem:** Functions return empty arrays or null

**Solutions:**
- Verify path is absolute
- Check SKILL.md exists in skill directory
- Ensure frontmatter is properly formatted with `---` delimiters

### Validation Fails Unexpectedly
**Problem:** Valid skills fail validation

**Solutions:**
- Check YAML frontmatter syntax (use YAML linter)
- Verify description follows "Use when [condition] - [what it does]" pattern
- Ensure content has at least one heading (#)

### Performance Issues
**Problem:** Operations slow on large skill collections

**Solutions:**
- Use `includeContent: false` in `calculateSkillStats()` for quick stats
- Filter by category/tag when possible
- Consider caching results for repeated operations

---

## See Also

- [Testing Documentation](./testing.md) - Testing skills with integration tests
- [Skills Improvement Plan](./plans/2025-11-28-skills-improvements-from-user-feedback.md) - Enhancement roadmap
- [writing-skills](../skills/writing-skills/SKILL.md) - How to create world-class skills

---

**Last Updated:** 2025-01-15
**Version:** 1.0.0
