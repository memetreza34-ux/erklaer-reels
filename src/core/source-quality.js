export const SOURCE_SCHEMA_MARKER = '<!-- sources-schema:2 -->';

function normalizeHost(hostname) {
  return String(hostname ?? '').toLowerCase().replace(/^www\./, '');
}

function fieldValues(text, labelPattern) {
  const expression = new RegExp(`^- ${labelPattern}:\\s*(.+)$`, 'gmi');
  return [...String(text ?? '').matchAll(expression)]
    .map((match) => String(match[1] ?? '').trim())
    .filter(Boolean);
}

function extractUrls(text) {
  const candidates = String(text ?? '').match(/https?:\/\/[^\s<>"'`]+/gi) ?? [];
  const urls = [];

  for (const candidate of candidates) {
    const cleaned = candidate.replace(/[),.;!?]+$/g, '');
    try {
      const parsed = new URL(cleaned);
      urls.push(parsed);
    } catch {
      // Ungültige URL wird nicht als belastbare Quelle gezählt.
    }
  }

  return urls;
}

export function inspectSourcesMarkdown(text) {
  const value = String(text ?? '');
  const schemaVersion = value.includes(SOURCE_SCHEMA_MARKER) ? 2 : 1;
  const urls = extractUrls(value);
  const httpsUrls = urls.filter((url) => url.protocol === 'https:');
  const hosts = [...new Set(httpsUrls.map((url) => normalizeHost(url.hostname)).filter(Boolean))];
  const titles = fieldValues(value, 'Titel\\/Institution');
  const dates = fieldValues(value, 'Datum\\/Zugriff');
  const evidence = fieldValues(value, 'Belegt');
  const hasPlaceholder = /\b(?:TODO|TBD|PLATZHALTER|BEISPIELQUELLE)\b|https?:\/\/(?:www\.)?example\.(?:com|org|net)\b/i.test(value);
  const hasInsecureHttp = urls.some((url) => url.protocol === 'http:');

  return {
    schemaVersion,
    urlCount: urls.length,
    httpsUrlCount: httpsUrls.length,
    distinctHostCount: hosts.length,
    hosts,
    titleCount: titles.length,
    dateCount: dates.length,
    evidenceCount: evidence.length,
    hasPlaceholder,
    hasInsecureHttp,
    passed: schemaVersion < 2 || (
      httpsUrls.length >= 2 &&
      hosts.length >= 2 &&
      titles.length >= 2 &&
      dates.length >= 2 &&
      evidence.length >= 2 &&
      !hasPlaceholder &&
      !hasInsecureHttp
    )
  };
}
