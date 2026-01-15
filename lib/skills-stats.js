import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Extract YAML frontmatter from a skill file.
 * Reuses the pattern from skills-core.js for consistency.
 *
 * @param {string} filePath - Path to SKILL.md file
 * @returns {{name: string, description: string, category: string}}
 */
function extractFrontmatter(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        let inFrontmatter = false;
        let name = '';
        let description = '';
        let category = '';

        for (const line of lines) {
            if (line.trim() === '---') {
                if (inFrontmatter) break;
                inFrontmatter = true;
                continue;
            }

            if (inFrontmatter) {
                const match = line.match(/^(\w+):\s*(.*)$/);
                if (match) {
                    const [, key, value] = match;
                    switch (key) {
                        case 'name':
                            name = value.trim();
                            break;
                        case 'description':
                            description = value.trim();
                            break;
                        case 'category':
                            category = value.trim();
                            break;
                    }
                }
            }
        }

        return { name, description, category };
    } catch (error) {
        return { name: '', description: '', category: '' };
    }
}

/**
 * Get file modification time.
 *
 * @param {string} filePath - Path to file
 * @returns {Date} File modification date
 */
function getFileMTime(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.mtime;
    } catch (error) {
        return new Date(0);
    }
}

/**
 * Get git creation date for a file (earliest commit).
 *
 * @param {string} filePath - Path to file
 * @param {string} repoRoot - Git repository root directory
 * @returns {Date|null} Git creation date or null if not available
 */
function getGitCreationDate(filePath, repoRoot) {
    try {
        const relativePath = path.relative(repoRoot, filePath);
        const output = execSync(
            `git log --diff-filter=A --follow --format=%ct -- "${relativePath}" | tail -1`,
            {
                cwd: repoRoot,
                timeout: 5000,
                encoding: 'utf8',
                stdio: 'pipe'
            }
        );

        if (output.trim()) {
            return new Date(parseInt(output.trim()) * 1000);
        }
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Get git last modified date for a file (latest commit).
 *
 * @param {string} filePath - Path to file
 * @param {string} repoRoot - Git repository root directory
 * @returns {Date|null} Git last modified date or null if not available
 */
function getGitModifiedDate(filePath, repoRoot) {
    try {
        const relativePath = path.relative(repoRoot, filePath);
        const output = execSync(
            `git log -1 --format=%ct -- "${relativePath}"`,
            {
                cwd: repoRoot,
                timeout: 5000,
                encoding: 'utf8',
                stdio: 'pipe'
            }
        );

        if (output.trim()) {
            return new Date(parseInt(output.trim()) * 1000);
        }
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Detect category from skill directory name or description.
 * This is a heuristic for skills without explicit category field.
 *
 * @param {string} skillDirName - Name of the skill directory
 * @param {string} description - Skill description
 * @returns {string} Detected category
 */
function detectCategory(skillDirName, description) {
    const lowerDir = skillDirName.toLowerCase();
    const lowerDesc = description.toLowerCase();

    // Development-related keywords
    if (lowerDir.includes('test') || lowerDir.includes('tdd') ||
        lowerDesc.includes('test') || lowerDesc.includes('tdd')) {
        return 'testing';
    }

    // Debugging-related
    if (lowerDir.includes('debug') || lowerDesc.includes('debug')) {
        return 'debugging';
    }

    // Collaboration-related
    if (lowerDir.includes('review') || lowerDir.includes('parallel') ||
        lowerDesc.includes('collaborat')) {
        return 'collaboration';
    }

    // Meta-related (skills about skills)
    if (lowerDir.includes('skill') || lowerDir.includes('writing') ||
        lowerDesc.includes('skill')) {
        return 'meta';
    }

    // Git-related
    if (lowerDir.includes('git') || lowerDesc.includes('git')) {
        return 'git';
    }

    // Default category
    return 'other';
}

/**
 * Find all SKILL.md files in a directory recursively.
 *
 * @param {string} dir - Directory to search
 * @param {number} maxDepth - Maximum recursion depth (default: 3)
 * @returns {Array<{path: string, name: string, description: string, category: string}>}
 */
function findAllSkills(dir, maxDepth = 3) {
    const skills = [];

    if (!fs.existsSync(dir)) {
        return skills;
    }

    function recurse(currentDir, depth) {
        if (depth > maxDepth) return;

        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                // Check for SKILL.md in this directory
                const skillFile = path.join(fullPath, 'SKILL.md');
                if (fs.existsSync(skillFile)) {
                    const { name, description, category } = extractFrontmatter(skillFile);
                    const detectedCategory = category || detectCategory(entry.name, description);

                    skills.push({
                        path: fullPath,
                        skillFile: skillFile,
                        name: name || entry.name,
                        description: description || '',
                        category: detectedCategory
                    });
                }

                // Recurse into subdirectories
                recurse(fullPath, depth + 1);
            }
        }
    }

    recurse(dir, 0);
    return skills;
}

/**
 * Find the git repository root directory.
 *
 * @param {string} startDir - Directory to start searching from
 * @returns {string|null} Git repository root or null if not found
 */
function findGitRoot(startDir) {
    let currentDir = startDir;

    while (currentDir !== path.parse(currentDir).root) {
        const gitDir = path.join(currentDir, '.git');
        if (fs.existsSync(gitDir)) {
            return currentDir;
        }

        currentDir = path.dirname(currentDir);
    }

    return null;
}

/**
 * Get comprehensive statistics about all skills in a directory.
 *
 * @param {string} skillsDir - Directory containing skills
 * @returns {Object} Statistics object with various metrics
 */
function getSkillsStats(skillsDir) {
    // Handle missing directory gracefully
    if (!fs.existsSync(skillsDir)) {
        return {
            total: 0,
            byCategory: {},
            withDescription: 0,
            withoutDescription: 0,
            newest: null,
            oldest: null,
            skills: []
        };
    }

    const skills = findAllSkills(skillsDir);
    const gitRoot = findGitRoot(skillsDir);

    // Enrich skills with date information
    const enrichedSkills = skills.map(skill => {
        const fileMTime = getFileMTime(skill.skillFile);
        let gitCreated = null;
        let gitModified = null;

        if (gitRoot) {
            gitCreated = getGitCreationDate(skill.skillFile, gitRoot);
            gitModified = getGitModifiedDate(skill.skillFile, gitRoot);
        }

        // Use git dates if available, otherwise fall back to file mtime
        const createdAt = gitCreated || fileMTime;
        const modifiedAt = gitModified || fileMTime;

        return {
            ...skill,
            createdAt,
            modifiedAt
        };
    });

    // Calculate statistics
    const byCategory = {};
    enrichedSkills.forEach(skill => {
        if (!byCategory[skill.category]) {
            byCategory[skill.category] = 0;
        }
        byCategory[skill.category]++;
    });

    const withDescription = enrichedSkills.filter(s => s.description.length > 0).length;
    const withoutDescription = enrichedSkills.length - withDescription;

    // Find newest and oldest skills
    let newest = null;
    let oldest = null;

    enrichedSkills.forEach(skill => {
        if (!newest || skill.modifiedAt > newest.modifiedAt) {
            newest = skill;
        }
        if (!oldest || skill.modifiedAt < oldest.modifiedAt) {
            oldest = skill;
        }
    });

    // Build simplified skills list for output
    const skillsList = enrichedSkills.map(skill => ({
        name: skill.name,
        description: skill.description,
        category: skill.category
    }));

    return {
        total: enrichedSkills.length,
        byCategory,
        withDescription,
        withoutDescription,
        newest: newest ? {
            name: newest.name,
            description: newest.description,
            category: newest.category,
            modifiedAt: newest.modifiedAt
        } : null,
        oldest: oldest ? {
            name: oldest.name,
            description: oldest.description,
            category: oldest.category,
            modifiedAt: oldest.modifiedAt
        } : null,
        skills: skillsList
    };
}

export { getSkillsStats };
