import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const STOP_WORDS = new Set([
  'warum','wieso','weshalb','wie','was','wer','wo','wann','ist','sind','war','waren','wird','wurde','wurden',
  'hat','haben','hatte','gibt','geben','es','ein','eine','einer','eines','einem','einen','der','die','das','den','dem',
  'des','und','oder','aber','zu','zur','zum','von','vom','im','in','am','an','auf','aus','mit','ohne','für','fuer',
  'sich','so','noch','heute','eigentlich','wirklich','überhaupt','ueberhaupt','nicht','mehr','als','bei','durch'
]);

function ascii(value) {
  return String(value ?? '')
    .toLowerCase()
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('ß', 'ss')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function normalizeTopic(value) {
  return ascii(value)
    .replace(/\b(wieso|weshalb)\b/g, 'warum')
    .replace(/\s+/g, ' ')
    .trim();
}

export function topicTokens(value) {
  return normalizeTopic(value)
    .split(' ')
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function trigrams(value) {
  const normalized = `  ${normalizeTopic(value)}  `;
  const set = new Set();
  for (let index = 0; index <= normalized.length - 3; index += 1) set.add(normalized.slice(index, index + 3));
  return set;
}

function overlap(a, b) {
  let common = 0;
  for (const item of a) if (b.has(item)) common += 1;
  return common;
}

export function similarityScore(candidate, existing) {
  const aNorm = normalizeTopic(candidate);
  const bNorm = normalizeTopic(existing);
  if (!aNorm || !bNorm) return { score: 0, commonTokens: 0, exact: false };
  if (aNorm === bNorm) return { score: 1, commonTokens: topicTokens(candidate).length, exact: true };

  const aTokens = new Set(topicTokens(candidate));
  const bTokens = new Set(topicTokens(existing));
  const commonTokens = overlap(aTokens, bTokens);
  const union = new Set([...aTokens, ...bTokens]).size || 1;
  const minSize = Math.max(1, Math.min(aTokens.size, bTokens.size));
  const jaccard = commonTokens / union;
  const containment = commonTokens / minSize;

  const aTri = trigrams(candidate);
  const bTri = trigrams(existing);
  const triCommon = overlap(aTri, bTri);
  const dice = (2 * triCommon) / Math.max(1, aTri.size + bTri.size);

  const score = Math.max(jaccard, containment * 0.9, dice * 0.78);
  return { score, commonTokens, exact: false, jaccard, containment, dice };
}

function decisionForMatch(match) {
  if (match.exact) return 'BLOCKED_DUPLICATE';
  if (match.commonTokens >= 2 && match.containment >= 0.6) return 'BLOCKED_DUPLICATE';
  if (match.dice >= 0.84) return 'BLOCKED_DUPLICATE';
  if (match.score >= 0.46) return 'REVIEW_SIMILAR';
  return 'APPROVED_NEW';
}

function cleanHistoryBullet(line) {
  let value = line.replace(/^\s*-\s*/, '').trim();
  value = value.replace(/^((Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag)(,\s*\d{2}\.\d{2}\.\d{4})?|KW\d+\s*\([^)]*\)):\s*/i, '');
  value = value.replace(/\s+—.*$/, '').trim();
  return value;
}

async function collectHistory(repoRoot) {
  const file = path.join(repoRoot, 'THEMEN_HISTORIE.md');
  let text = '';
  try { text = await readFile(file, 'utf8'); } catch { return []; }
  return text.split(/\r?\n/)
    .filter((line) => /^\s*-\s+/.test(line))
    .map(cleanHistoryBullet)
    .filter(Boolean)
    .map((title) => ({ title, aliases: [], source: 'history', id: null }));
}

async function walkForVideoJson(directory, output = []) {
  let entries = [];
  try { entries = await readdir(directory, { withFileTypes: true }); } catch { return output; }
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) await walkForVideoJson(full, output);
    else if (entry.isFile() && entry.name === 'video.json' && path.basename(path.dirname(full)) === '99-technik') output.push(full);
  }
  return output;
}

async function collectYoutubeProjects(repoRoot, excludeProjectDir) {
  const youtubeRoot = path.join(repoRoot, 'youtube');
  const files = await walkForVideoJson(youtubeRoot);
  const excluded = excludeProjectDir ? path.resolve(excludeProjectDir) : null;
  const records = [];
  for (const file of files) {
    const projectDir = path.dirname(path.dirname(file));
    if (excluded && path.resolve(projectDir) === excluded) continue;
    try {
      const meta = JSON.parse(await readFile(file, 'utf8'));
      if (!meta.title && !meta.topic) continue;
      records.push({
        title: meta.title || meta.topic,
        aliases: meta.topic && meta.topic !== meta.title ? [meta.topic] : [],
        source: 'youtube-project',
        id: meta.videoId || null,
        projectDir
      });
    } catch {
      // Defekte Metadatei wird von den normalen Produktionsgates behandelt.
    }
  }
  return records;
}

async function collectRegistry(repoRoot) {
  const file = path.join(repoRoot, 'config', 'youtube-topic-registry.json');
  try {
    const registry = JSON.parse(await readFile(file, 'utf8'));
    return (registry.entries || []).map((entry) => ({ ...entry, source: 'registry' }));
  } catch {
    return [];
  }
}

function recordVariants(record) {
  return [record.title, ...(record.aliases || [])].filter(Boolean);
}

export async function checkYoutubeTopic({
  candidateTitle,
  repoRoot = process.cwd(),
  selfVideoId = null,
  excludeProjectDir = null
}) {
  if (!candidateTitle?.trim()) throw new Error('candidateTitle fehlt.');

  const [history, projects, registry] = await Promise.all([
    collectHistory(repoRoot),
    collectYoutubeProjects(repoRoot, excludeProjectDir),
    collectRegistry(repoRoot)
  ]);

  const selfRegistry = registry.filter((record) => selfVideoId && record.id === selfVideoId);
  const selfTitles = new Set(selfRegistry.flatMap(recordVariants).map(normalizeTopic));
  const records = [...history, ...projects, ...registry].filter((record) => {
    if (selfVideoId && record.id === selfVideoId) return false;
    if (record.source === 'history' && selfTitles.has(normalizeTopic(record.title))) return false;
    return true;
  });

  let best = null;
  for (const record of records) {
    for (const variant of recordVariants(record)) {
      const metrics = similarityScore(candidateTitle, variant);
      const candidate = { ...metrics, matchedTitle: record.title, matchedVariant: variant, source: record.source, id: record.id || null };
      if (!best || candidate.score > best.score || (candidate.exact && !best.exact)) best = candidate;
    }
  }

  best ||= { score: 0, commonTokens: 0, exact: false, matchedTitle: null, matchedVariant: null, source: null, id: null };
  const decision = decisionForMatch(best);
  return {
    editorVersion: 1,
    candidateTitle,
    decision,
    isNew: decision === 'APPROVED_NEW',
    comparedRecordCount: records.length,
    closestMatch: {
      title: best.matchedTitle,
      variant: best.matchedVariant,
      source: best.source,
      score: Number((best.score || 0).toFixed(3)),
      commonTokens: best.commonTokens || 0
    }
  };
}
