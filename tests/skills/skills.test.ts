import { describe, expect, it } from 'bun:test';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DEBO_MCP_TOOLS } from '@debo/mcp';

interface SkillManifestItem {
  name: string;
  version: string;
  description: string;
  path: string;
  tools: string[];
  tags: string[];
}

interface SkillsManifest {
  name: string;
  version: string;
  description: string;
  skills: SkillManifestItem[];
}

function parseFrontmatter(markdown: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    throw new Error('Missing frontmatter delimiter');
  }

  const rawYaml = match[1]!;
  const body = match[2]!;
  const frontmatter: Record<string, unknown> = {};

  const lines = rawYaml.split(/\r?\n/);
  let currentKey: string | null = null;
  let currentList: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('- ')) {
      if (currentKey) {
        currentList.push(trimmed.slice(2).trim());
        frontmatter[currentKey] = currentList;
      }
      continue;
    }

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx > 0) {
      currentKey = trimmed.slice(0, colonIdx).trim();
      const val = trimmed.slice(colonIdx + 1).trim();
      if (val === '') {
        currentList = [];
        frontmatter[currentKey] = currentList;
      } else {
        frontmatter[currentKey] = val;
      }
    }
  }

  return { frontmatter, body };
}

describe('Debo Portable Agent Skills Suite (Phase 11)', () => {
  const rootDir = process.cwd();
  const skillsDir = join(rootDir, 'skills');
  const manifestPath = join(skillsDir, 'skills.json');

  it('provides a valid skills.json catalog manifest', () => {
    expect(existsSync(manifestPath)).toBe(true);
    const manifest: SkillsManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

    expect(manifest.name).toBe('debo-skills');
    expect(manifest.skills).toBeDefined();
    expect(manifest.skills.length).toBe(6);
  });

  it('validates all 6 skills against normative specifications', () => {
    const manifest: SkillsManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    const registeredTools = new Set(DEBO_MCP_TOOLS.map(t => t.name));

    // Additional standard workflow/context tools accepted
    const allowedTools = new Set([
      ...registeredTools,
      'debo_approve_workflow',
      'debo_run_workflow',
      'debo_get_workflow',
      'debo_get_project_context',
      'debo_create_task',
      'debo_create_decision',
      'debo_search_sources',
      'debo_get_document',
      'debo_get_timeline',
    ]);

    for (const item of manifest.skills) {
      const skillFilePath = join(rootDir, item.path);
      expect(existsSync(skillFilePath)).toBe(true);

      const content = readFileSync(skillFilePath, 'utf-8');
      const { frontmatter, body } = parseFrontmatter(content);

      // Verify frontmatter fields
      expect(frontmatter.name).toBe(item.name);
      expect(frontmatter.version).toBe(item.version);
      expect(typeof frontmatter.description).toBe('string');
      expect((frontmatter.description as string).length).toBeGreaterThan(10);

      // Verify tools declaration
      const toolsRequired = frontmatter.tools_required as string[];
      expect(Array.isArray(toolsRequired)).toBe(true);
      expect(toolsRequired.length).toBeGreaterThanOrEqual(1);

      for (const tool of toolsRequired) {
        expect(allowedTools.has(tool)).toBe(true);
      }

      // Verify body structure
      expect(body).toContain('# Debo');
      expect(body.length).toBeGreaterThan(200);
    }
  });

  it('verifies all skill directories in skills/ are cataloged in skills.json', () => {
    const manifest: SkillsManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    const manifestNames = new Set(manifest.skills.map(s => s.name));

    const skillFolders = readdirSync(skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    expect(skillFolders.length).toBe(6);
    for (const folder of skillFolders) {
      expect(manifestNames.has(folder)).toBe(true);
    }
  });
});
