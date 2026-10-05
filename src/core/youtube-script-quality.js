const DEFAULT_STOP_WORDS = new Set([
  'aber', 'alle', 'alles', 'auch', 'aus', 'bei', 'das', 'dem', 'den', 'der', 'des', 'die', 'ein', 'eine',
  'einem', 'einen', 'einer', 'eines', 'für', 'gegen', 'ging', 'hat', 'ist', 'mit', 'nach', 'oder', 'sein',
  'seine', 'sich', 'sind', 'und', 'unter', 'von', 'vor', 'war', 'waren', 'was', 'wie', 'wirklich', 'wurde',
  'wurden', 'warum', 'welche', 'welcher', 'welches', 'zum', 'zur'
]);

function normalize(value) {
  return String(value ?? '')
    .toLocaleLowerCase('de-DE')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9äöü\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stemGermanToken(token) {
  let value = normalize(token).replace(/-/g, '');
  if (value.length <= 5) return value;
  for (const suffix of ['ern', 'em', 'er', 'en', 'es', 'e', 'n', 's']) {
    if (value.endsWith(suffix) && value.length - suffix.length >= 4) {
      value = value.slice(0, -suffix.length);
      break;
    }
  }
  return value;
}

function words(text) {
  return String(text ?? '').match(/[A-Za-zÄÖÜäöüß0-9]+(?:[-’'][A-Za-zÄÖÜäöüß0-9]+)*/g) ?? [];
}

function sentences(text) {
  return String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function paragraphs(text) {
  return String(text ?? '')
    .split(/\n\s*\n/)
    .map((item) => item.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function countRegex(text, regex) {
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`;
  return [...String(text ?? '').matchAll(new RegExp(regex.source, flags))].length;
}

function countCausalSignals(text) {
  return countRegex(text, /\b(?:weil|deshalb|dadurch|daher|weshalb|wodurch|folglich|somit)\b/gi)
    + countRegex(text, /\b(?:das bedeutet|der grund|die folge|fuehrte dazu|führte dazu|sorgte dafür|entscheidend (?:war|ist)|aus diesem grund|hatte zur folge|hat zur folge)\b/gi);
}

function countConcreteSignals(text) {
  const years = countRegex(text, /\b(?:1[5-9]\d{2}|20\d{2})\b/g);
  const quantities = countRegex(text, /\b\d+(?:[.,]\d+)?\s*(?:%|prozent|millionen?|milliarden?|tausend|kilometer|km|jahre?|monate?|tage?|stunden?)\b/gi);
  const examples = countRegex(text, /\b(?:zum beispiel|beispielsweise|ein beispiel|konkret|etwa im fall|etwa bei)\b/gi);
  return years + quantities + examples;
}

function significantTopicStems(topic, title) {
  const tokens = [...words(topic), ...words(title)]
    .map((token) => normalize(token))
    .filter((token) => token.length >= 4 && !DEFAULT_STOP_WORDS.has(token))
    .map(stemGermanToken)
    .filter((token) => token.length >= 4);
  return [...new Set(tokens)];
}

function openingMentionsTopic(opening, topic, title) {
  const stems = significantTopicStems(topic, title);
  if (!stems.length) return true;
  const openingStems = new Set(words(opening).map(stemGermanToken));
  return stems.some((stem) => openingStems.has(stem));
}

function repeatedParagraphStarters(items) {
  const counts = new Map();
  for (const paragraph of items) {
    const starter = words(paragraph).slice(0, 2).map((item) => normalize(item)).join(' ');
    if (!starter) continue;
    counts.set(starter, (counts.get(starter) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export function validateYoutubeScriptQuality(script, policy = {}, context = {}) {
  const text = String(script ?? '').trim();
  const errors = [];
  const warnings = [];

  if (!text) {
    return { passed: false, errors: ['Sprechertext ist leer.'], warnings, metrics: {} };
  }

  const allWords = words(text);
  const allSentences = sentences(text);
  const allParagraphs = paragraphs(text);
  const wordCount = allWords.length;
  const openingWindowCharacters = Number(policy.openingWindowCharacters) || 750;
  const opening = text.slice(0, openingWindowCharacters);

  const forbiddenOpeningPhrases = Array.isArray(policy.forbiddenOpeningPhrases)
    ? policy.forbiddenOpeningPhrases
    : [];
  for (const phrase of forbiddenOpeningPhrases) {
    if (normalize(opening).includes(normalize(phrase))) {
      errors.push(`Der Einstieg enthält die künftig verbotene Standardfloskel: "${phrase}"`);
    }
  }

  if (policy.legacyQuestionThoughtShortAnswerTemplateForbidden !== false) {
    const legacySignature = /\?[\s\S]{0,180}denkst du dir gerade vielleicht\.[\s\S]{0,180}(?:kurz|einfach) gesagt:/i;
    if (legacySignature.test(opening)) {
      errors.push('Der Einstieg verwendet wieder das alte starre Muster Frage → „Denkst du dir gerade vielleicht“ → Kurzantwort.');
    }
  }

  if (policy.topicMentionRequiredInOpening === true && !openingMentionsTopic(opening, context.topic, context.title)) {
    errors.push('Der Einstieg stellt den konkreten Videogegenstand nicht früh genug her. Innerhalb des Opening-Fensters muss das eigentliche Thema erkennbar genannt werden.');
  }

  const causalSignals = countCausalSignals(text);
  const concreteSignals = countConcreteSignals(text);
  const minimumWordsForDepthChecks = Number(policy.minimumWordsForDepthChecks) || 450;

  if (wordCount >= minimumWordsForDepthChecks && policy.causalExplanationRequired !== false) {
    const rate = Number(policy.minimumCausalSignalsPer1000Words) || 6;
    const required = Math.max(3, Math.ceil((wordCount / 1000) * rate));
    if (causalSignals < required) {
      errors.push(`Zu wenig erklärender Mehrwert: ${causalSignals} Ursache-/Folge-Signale gefunden, mindestens ${required} erwartet. Das Skript darf Ereignisse nicht nur aufzählen, sondern muss Zusammenhänge erklären.`);
    }
  }

  if (wordCount >= minimumWordsForDepthChecks && policy.concreteExamplesOrFactsRequired !== false) {
    const rate = Number(policy.minimumConcreteSignalsPer1000Words) || 3;
    const required = Math.max(2, Math.ceil((wordCount / 1000) * rate));
    if (concreteSignals < required) {
      errors.push(`Zu wenig konkrete Belege/Beispiele: ${concreteSignals} konkrete Zeit-, Mengen- oder Beispielsignale gefunden, mindestens ${required} erwartet.`);
    }
  }

  const sentenceLengths = allSentences.map((sentence) => words(sentence).length).filter((value) => value > 0);
  const averageSentenceWords = sentenceLengths.length
    ? sentenceLengths.reduce((sum, value) => sum + value, 0) / sentenceLengths.length
    : 0;
  const longSentenceThreshold = Number(policy.longSentenceWordThreshold) || 38;
  const longSentenceCount = sentenceLengths.filter((value) => value > longSentenceThreshold).length;
  const longSentenceRatio = sentenceLengths.length ? longSentenceCount / sentenceLengths.length : 0;

  if (policy.spokenReadabilityRequired !== false) {
    const maxAverage = Number(policy.maxAverageSentenceWords) || 25;
    const maxLongRatio = Number(policy.maxLongSentenceRatio) || 0.2;
    if (averageSentenceWords > maxAverage) {
      errors.push(`Sprechertext ist im Durchschnitt zu verschachtelt: ${averageSentenceWords.toFixed(1)} Wörter pro Satz, maximal ${maxAverage}.`);
    }
    if (sentenceLengths.length >= 8 && longSentenceRatio > maxLongRatio) {
      errors.push(`Zu viele sehr lange Sätze: ${(longSentenceRatio * 100).toFixed(0)} % liegen über ${longSentenceThreshold} Wörtern; erlaubt sind höchstens ${(maxLongRatio * 100).toFixed(0)} %.`);
    }
  }

  const maxParagraphWords = Number(policy.maxParagraphWords) || 180;
  const oversizedParagraphs = allParagraphs
    .map((paragraph, index) => ({ index: index + 1, count: words(paragraph).length }))
    .filter((item) => item.count > maxParagraphWords);
  if (oversizedParagraphs.length) {
    const details = oversizedParagraphs.map((item) => `Absatz ${item.index}: ${item.count}`).join(', ');
    errors.push(`Zu lange Sprechertext-Absätze (${details} Wörter). Maximal ${maxParagraphWords} Wörter pro Absatz; lange Blöcke müssen für verständliches Voice-over gegliedert werden.`);
  }

  const repeatedStarterLimit = Number(policy.repeatedParagraphStarterLimit) || 3;
  const repeatedStarters = repeatedParagraphStarters(allParagraphs).filter(([, count]) => count > repeatedStarterLimit);
  for (const [starter, count] of repeatedStarters) {
    warnings.push(`Absatzanfang „${starter}“ wiederholt sich ${count}×. Übergänge prüfen, damit der Text nicht mechanisch wirkt.`);
  }

  const questionCount = countRegex(text, /\?/g);
  const maxQuestionsPer1000Words = Number(policy.maxQuestionsPer1000Words) || 10;
  if (wordCount >= minimumWordsForDepthChecks && questionCount > Math.ceil((wordCount / 1000) * maxQuestionsPer1000Words)) {
    warnings.push(`Viele rhetorische Fragen (${questionCount}). Prüfen, ob Fragen durch konkrete Erzählung oder Erklärung ersetzt werden können.`);
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    metrics: {
      wordCount,
      paragraphCount: allParagraphs.length,
      sentenceCount: allSentences.length,
      causalSignals,
      concreteSignals,
      averageSentenceWords: Number(averageSentenceWords.toFixed(2)),
      longSentenceCount,
      longSentenceRatio: Number(longSentenceRatio.toFixed(3)),
      questionCount
    }
  };
}
