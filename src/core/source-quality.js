export const SOURCE_SCHEMA_VERSION = 3;
export const SOURCE_SCHEMA_MARKER = '<!-- sources-schema:3 -->';
export const SOURCE_SCHEMA_V2_MARKER = '<!-- sources-schema:2 -->';

export function buildSourcesTemplate() {
  return `# Quellen\n${SOURCE_SCHEMA_MARKER}\n\nFür neue Reels mindestens zwei echte, nachvollziehbare und voneinander unabhängige Quellen eintragen. Alle Felder vollständig mit tatsächlich verwendeten Quellen ausfüllen.\n\nQuellenrolle für Schema 3:\n- mindestens eine Primär-/offizielle Quelle oder wissenschaftliche Originalquelle\n- mindestens eine davon unabhängige Sekundär-/Fachquelle\n- unterschiedliche Hosts/Domains verwenden\n- unter \"Belegt\" konkret notieren, welche Reel-Aussage die Quelle stützt\n\n## Quelle 1\n- Titel/Institution:\n- URL:\n- Datum/Zugriff:\n- Quellentyp:\n- Belegt:\n\n## Quelle 2\n- Titel/Institution:\n- URL:\n- Datum/Zugriff:\n- Quellentyp:\n- Belegt:\n`;
}

function normalizeHost(hostname) {
  return String(hostname ?? '').toLowerCase().replace(/^www\./, '');
}

function fieldValues(text, labelPattern) {
  const expression = new RegExp(`^- ${labelPattern}:\\s*(.+)$`, 'gmi');
  return [...String(text ?? '').matchAll(expression)]
    .map((match) => String(match[1] ?? '').trim())
    .filter(Boolean);
}

function parseHttpUrl(value) {
  try {
    const parsed = new URL(String(value ?? '').trim());
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed : null;
  } catch {
    return null;
  }
}

function detectSchemaVersion(value) {
  if (value.includes(SOURCE_SCHEMA_MARKER)) return 3;
  if (value.includes(SOURCE_SCHEMA_V2_MARKER)) return 2;
  return 1;
}

function isPrimaryOrOfficialSourceType(value) {
  return /(?:primär|primaer|offiziell|originalquelle|originalstudie|original source|primary source)/i.test(String(value ?? ''));
}

function isIndependentSecondarySourceType(value) {
  return /(?:unabhängig|unabhaengig|sekundär|sekundaer|fachquelle|fachlich|journalistisch|secondary source)/i.test(String(value ?? ''));
}

export function inspectSourcesMarkdown(text) {
  const value = String(text ?? '');
  const schemaVersion = detectSchemaVersion(value);
  const urlValues = fieldValues(value, 'URL');
  const urls = urlValues.map(parseHttpUrl).filter(Boolean);
  const httpsUrls = urls.filter((url) => url.protocol === 'https:');
  const hosts = [...new Set(httpsUrls.map((url) => normalizeHost(url.hostname)).filter(Boolean))];
  const titles = fieldValues(value, 'Titel\\/Institution');
  const dates = fieldValues(value, 'Datum\\/Zugriff');
  const sourceTypes = fieldValues(value, 'Quellentyp');
  const evidence = fieldValues(value, 'Belegt');
  const structuredValues = [...urlValues, ...titles, ...dates, ...sourceTypes, ...evidence].join('\n');
  const hasPlaceholder = /\b(?:TODO|TBD|PLATZHALTER|BEISPIELQUELLE)\b/i.test(structuredValues) ||
    urls.some((url) => /^(?:www\.)?example\.(?:com|org|net)$/i.test(url.hostname));
  const hasInsecureHttp = urls.some((url) => url.protocol === 'http:');
  const hasMalformedUrlField = urlValues.length !== urls.length;
  const hasPrimaryOrOfficial = sourceTypes.some(isPrimaryOrOfficialSourceType);
  const hasIndependentSecondary = sourceTypes.some(isIndependentSecondarySourceType);

  const baselinePassed = (
    urlValues.length >= 2 &&
    httpsUrls.length >= 2 &&
    hosts.length >= 2 &&
    titles.length >= 2 &&
    dates.length >= 2 &&
    evidence.length >= 2 &&
    !hasPlaceholder &&
    !hasInsecureHttp &&
    !hasMalformedUrlField
  );

  const schema3Passed = baselinePassed &&
    sourceTypes.length >= 2 &&
    hasPrimaryOrOfficial &&
    hasIndependentSecondary;

  return {
    schemaVersion,
    urlFieldCount: urlValues.length,
    urlCount: urls.length,
    httpsUrlCount: httpsUrls.length,
    distinctHostCount: hosts.length,
    hosts,
    titleCount: titles.length,
    dateCount: dates.length,
    sourceTypeCount: sourceTypes.length,
    sourceTypes,
    evidenceCount: evidence.length,
    hasPrimaryOrOfficial,
    hasIndependentSecondary,
    hasPlaceholder,
    hasInsecureHttp,
    hasMalformedUrlField,
    passed: schemaVersion < 2 || (schemaVersion === 2 ? baselinePassed : schema3Passed)
  };
}
