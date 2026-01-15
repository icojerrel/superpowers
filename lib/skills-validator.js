import fs from 'fs';
import path from 'path';

/**
 * Validates a single skill file.
 *
 * @param {string} skillPath - Path to a skill directory or SKILL.md file
 * @returns {{valid: boolean, errors: string[], warnings: string[], skillName: string}}
 */
function validateSkill(skillPath) {
    const result = {
        valid: true,
        errors: [],
        warnings: [],
        skillName: ''
    };

    let skillFile = skillPath;

    // If skillPath is a directory, look for SKILL.md inside
    if (fs.existsSync(skillPath) && fs.statSync(skillPath).isDirectory()) {
        skillFile = path.join(skillPath, 'SKILL.md');
    }

    // 1. Check file exists and is readable
    if (!fs.existsSync(skillFile)) {
        result.valid = false;
        result.errors.push(`File not found: ${skillFile}`);
        return result;
    }

    try {
        fs.accessSync(skillFile, fs.constants.R_OK);
    } catch (error) {
        result.valid = false;
        result.errors.push(`File is not readable: ${skillFile}`);
        return result;
    }

    // Read file content
    let content;
    try {
        content = fs.readFileSync(skillFile, 'utf8');
    } catch (error) {
        result.valid = false;
        result.errors.push(`Failed to read file: ${error.message}`);
        return result;
    }

    // Normalize line endings
    content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 2. Check YAML frontmatter is present
    if (!content.startsWith('---')) {
        result.valid = false;
        result.errors.push('Missing YAML frontmatter (file must start with `---`)');
        return result;
    }

    // Extract frontmatter
    const lines = content.split('\n');
    let inFrontmatter = false;
    let frontmatterEnded = false;
    let frontmatterEndLine = 0;

    const frontmatter = {};
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '---') {
            if (inFrontmatter) {
                frontmatterEnded = true;
                frontmatterEndLine = i;
                break;
            }
            inFrontmatter = true;
            continue;
        }

        if (inFrontmatter) {
            const match = line.match(/^(\w+):\s*(.*)$/);
            if (match) {
                const [, key, value] = match;
                // Remove surrounding quotes if present
                let cleanValue = value.trim();
                if ((cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
                    (cleanValue.startsWith("'") && cleanValue.endsWith("'"))) {
                    cleanValue = cleanValue.slice(1, -1);
                }
                frontmatter[key] = cleanValue;
            }
        }
    }

    if (!frontmatterEnded) {
        result.valid = false;
        result.errors.push('YAML frontmatter is not properly closed (missing closing `---`)');
    }

    // 3. Check required fields
    if (!frontmatter.name) {
        result.valid = false;
        result.errors.push('Missing required field: `name`');
    } else {
        result.skillName = frontmatter.name;

        // 4. Validate skill name format (kebab-case)
        const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
        if (!kebabCaseRegex.test(frontmatter.name)) {
            result.valid = false;
            result.errors.push(
                `Invalid skill name format: "${frontmatter.name}". ` +
                `Skill names must be in kebab-case (lowercase letters, numbers, and hyphens only, no consecutive hyphens)`
            );
        }

        // Warning: name should match directory name
        const dirName = path.basename(path.dirname(skillFile));
        if (dirName !== frontmatter.name) {
            result.warnings.push(
                `Skill name "${frontmatter.name}" does not match directory name "${dirName}"`
            );
        }
    }

    if (!frontmatter.description) {
        result.valid = false;
        result.errors.push('Missing required field: `description`');
    } else {
        // 5. Check description is not empty
        if (frontmatter.description.trim().length === 0) {
            result.valid = false;
            result.errors.push('Description field is empty');
        }

        // Warning: description should be substantive
        if (frontmatter.description.trim().length < 20) {
            result.warnings.push(
                `Description is very short (${frontmatter.description.length} chars). ` +
                `A good description should clearly explain when to use this skill.`
            );
        }
    }

    // 6. Check content section exists after frontmatter
    const contentAfterFrontmatter = content.split('\n').slice(frontmatterEndLine + 1).join('\n').trim();
    if (contentAfterFrontmatter.length === 0) {
        result.valid = false;
        result.errors.push('No content found after frontmatter. Skill files must have a content section.');
    }

    return result;
}

/**
 * Validates all skill files in a directory.
 *
 * @param {string} skillsDir - Directory containing skill subdirectories
 * @returns {{valid: boolean, results: Array<{skillName: string, skillPath: string, valid: boolean, errors: string[], warnings: string[]}>}}
 */
function validateAllSkills(skillsDir) {
    const results = [];
    let allValid = true;

    if (!fs.existsSync(skillsDir)) {
        return {
            valid: false,
            results: [{
                skillName: '',
                skillPath: skillsDir,
                valid: false,
                errors: [`Skills directory not found: ${skillsDir}`],
                warnings: []
            }]
        };
    }

    // Find all subdirectories with SKILL.md files
    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory()) {
            const skillPath = path.join(skillsDir, entry.name);
            const skillFile = path.join(skillPath, 'SKILL.md');

            if (fs.existsSync(skillFile)) {
                const validationResult = validateSkill(skillFile);
                if (!validationResult.valid) {
                    allValid = false;
                }

                results.push({
                    skillName: validationResult.skillName || entry.name,
                    skillPath: skillPath,
                    valid: validationResult.valid,
                    errors: validationResult.errors,
                    warnings: validationResult.warnings
                });
            }
        }
    }

    return {
        valid: allValid,
        results: results
    };
}

/**
 * Format validation results as a human-readable string.
 *
 * @param {{valid: boolean, errors: string[], warnings: string[], skillName: string}} result - Validation result
 * @param {string} skillPath - Path to the skill file
 * @returns {string} - Formatted validation report
 */
function formatValidationResult(result, skillPath) {
    const status = result.valid ? '✓ VALID' : '✗ INVALID';
    const output = [`\n${status}: ${result.skillName || 'Unknown'} (${skillPath})`];

    if (result.errors.length > 0) {
        output.push('\nErrors:');
        result.errors.forEach(error => {
            output.push(`  • ${error}`);
        });
    }

    if (result.warnings.length > 0) {
        output.push('\nWarnings:');
        result.warnings.forEach(warning => {
            output.push(`  • ${warning}`);
        });
    }

    if (result.valid && result.warnings.length === 0) {
        output.push('  All checks passed!');
    }

    return output.join('\n');
}

/**
 * Format batch validation results as a human-readable string.
 *
 * @param {{valid: boolean, results: Array}} batchResult - Result from validateAllSkills
 * @returns {string} - Formatted batch validation report
 */
function formatBatchValidationResult(batchResult) {
    const { valid, results } = batchResult;
    const total = results.length;
    const validCount = results.filter(r => r.valid).length;
    const invalidCount = total - validCount;

    let output = `\nSkills Validation Summary`;
    output += `\n${'='.repeat(50)}`;
    output += `\nTotal: ${total} | Valid: ${validCount} | Invalid: ${invalidCount}`;

    if (valid) {
        output += '\n\n✓ All skills are valid!';
    } else {
        output += '\n\n✗ Some skills have validation errors:\n';
    }

    // Show detailed results for invalid skills
    results.forEach(result => {
        if (!result.valid) {
            output += `\n${formatValidationResult(result, result.skillPath)}`;
        }
    });

    // Show warnings for valid skills
    results.forEach(result => {
        if (result.valid && result.warnings.length > 0) {
            output += `\n${formatValidationResult(result, result.skillPath)}`;
        }
    });

    return output + '\n';
}

export {
    validateSkill,
    validateAllSkills,
    formatValidationResult,
    formatBatchValidationResult
};
