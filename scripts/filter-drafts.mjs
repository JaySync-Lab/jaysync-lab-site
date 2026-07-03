#!/usr/bin/env node
/**
 * filter-drafts.mjs
 *
 * Runs after docs/ is pulled from JaySync-Lab into content/, before build.
 * Removes any .mdx file with status: draft, and removes its slug from the
 * containing folder's meta.json "pages" array so Fumadocs doesn't reference
 * a file that no longer exists.
 *
 * Plain Node, no dependencies — mirrors the style of validate-docs.mjs in
 * JaySync-Lab so both repos can be reasoned about the same way.
 */

import { readdirSync, readFileSync, writeFileSync, unlinkSync, statSync, existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

const CONTENT_ROOT = 'content';
let removed = [];

function getStatus(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const statusLine = match[1].split('\n').find((l) => l.trim().startsWith('status:'));
  if (!statusLine) return null;
  return statusLine.split(':')[1].trim().replace(/["']/g, '');
}

function walk(dir) {
  const entries = readdirSync(dir);

  // Compute subdirectories BEFORE any deletions happen in this pass, so the
  // recursion loop below never has to stat a file this function just removed.
  const subdirs = entries.filter((e) => statSync(join(dir, e)).isDirectory());
  const mdxFiles = entries.filter((e) => extname(e) === '.mdx');
  const draftSlugs = [];

  for (const file of mdxFiles) {
    const filePath = join(dir, file);
    const status = getStatus(filePath);
    if (status === 'draft') {
      draftSlugs.push(basename(file, '.mdx'));
      unlinkSync(filePath);
      removed.push(filePath);
    }
  }

  if (draftSlugs.length > 0) {
    const metaPath = join(dir, 'meta.json');
    if (existsSync(metaPath)) {
      const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
      if (Array.isArray(meta.pages)) {
        meta.pages = meta.pages.filter((p) => !draftSlugs.includes(p));
        writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n');
      }
    }
  }

  for (const sub of subdirs) {
    walk(join(dir, sub));
  }
}

if (!existsSync(CONTENT_ROOT)) {
  console.error(`Error: "${CONTENT_ROOT}" folder not found.`);
  process.exit(1);
}

walk(CONTENT_ROOT);

if (removed.length > 0) {
  console.log(`Filtered ${removed.length} draft page(s) before build:`);
  for (const r of removed) console.log(`  - ${r}`);
} else {
  console.log('No draft pages found — nothing filtered.');
}
