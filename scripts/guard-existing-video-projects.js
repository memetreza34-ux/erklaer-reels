#!/usr/bin/env node
/**
 * Guard for improvement PRs: no edits to an existing video without an explicit,
 * project-specific user request recorded in the PR description.
 *
 * New projects are permitted. Shared pipeline, templates, code and tests are
 * outside this guard. The human/agent must still verify actual user consent.
 */
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export function videoProjectRoot(filePath) {
  const parts = String(filePath).split('/');
  if (!/^20\d{2}-KW\d{2}_/.test(parts[1] || '')) return null;
  if (parts[0] === 'youtube' && parts.length >= 4 &&
      parts[2] !== 'templates') return parts.slice(0, 3).join('/');
  if (parts[0] === 'reels' && parts.length >= 5 &&
      /^reel-\d+_/i.test(parts[3])) return parts.slice(0, 4).join('/');
  if (parts[0] === 'reels' && parts.length >= 4 &&
      /^reel-\d+_/i.test(parts[2])) return parts.slice(0, 3).join('/');
  return null;
}

export function recordedApprovals(prBody) {
  const body = String(prBody || '');
  const match = body.match(/^USER_REQUEST_QUOTE:\s*(.+)$/m);
  // The exact user request must be documented, not a vague approval checkbox.
  if (!match || match[1].trim().length < 12) return new Set();
  const roots = new Set();
  for (const line of body.split(/\r?\n/)) {
    const approved = line.match(/^EXPLICIT_VIDEO_EDIT_APPROVAL:\s*(\S+)\s*$/);
    if (!approved) continue;
    const root = approved[1].replace(/\/$/, '');
    // Never accept "all", globbing or bare week folders.
    if (videoProjectRoot(root + '/README.md') === root) roots.add(root);
  }
  return roots;
}

export function unapprovedExistingProjects(changedPaths, rootExistsInBase, prBody = '') {
  const approvals = recordedApprovals(prBody);
  const affected = new Set();
  for (const filePath of changedPaths) {
    const root = videoProjectRoot(filePath);
    if (root && rootExistsInBase(root) && !approvals.has(root)) affected.add(root);
  }
  return [...affected].sort();
}

function git(args, options = {}) {
  return execFileSync('git', args, { encoding: 'utf8', ...options });
}

export function checkPullRequest({ baseSha, prBody = '' }) {
  if (!/^[0-9a-f]{40}$/i.test(baseSha || '')) {
    throw new Error('Der exakte PR-Base-Commit fehlt. Der Schutzcheck darf nicht übersprungen werden.');
  }
  // --no-renames captures both old and new paths of moved files.
  const changed = git(['diff', '--name-only', '--no-renames', '-z', baseSha, 'HEAD'])
    .split('\0').filter(Boolean);
  const rootCache = new Map();
  const exists = root => {
    if (!rootCache.has(root)) {
      let result = false;
      try {
        git(['cat-file', '-e', baseSha + ':' + root], { stdio: 'ignore' });
        result = true;
      } catch { /* folder does not exist in PR base */ }
      rootCache.set(root, result);
    }
    return rootCache.get(root);
  };
  return unapprovedExistingProjects(changed, exists, prBody);
}

function main() {
  const blocked = checkPullRequest({
    baseSha: process.env.VIDEO_CHANGE_BASE_SHA,
    prBody: process.env.VIDEO_CHANGE_PR_BODY || ''
  });
  if (blocked.length) {
    console.error('VIDEO-PROJEKTSCHUTZ: BLOCKIERT');
    console.error('Bestehende Videos dürfen bei allgemeinen Repo-Verbesserungen nicht verändert werden.');
    for (const root of blocked) console.error('- ' + root);
    console.error('Nur bei ausdrücklichem Nutzerauftrag: PR-Text mit EXPLICIT_VIDEO_EDIT_APPROVAL: <exakter Projektordner> und USER_REQUEST_QUOTE: <wörtliche Nutzeranweisung> ergänzen.');
    process.exitCode = 1;
    return;
  }
  console.log('VIDEO-PROJEKTSCHUTZ: BESTANDEN — keine unbeauftragte Änderung an bestehenden Videoprojekten.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { main(); } catch (error) {
    console.error('VIDEO-PROJEKTSCHUTZ: FEHLER — ' + error.message);
    process.exitCode = 1;
  }
}
