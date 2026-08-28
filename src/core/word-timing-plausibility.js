// Erkennt Wortzeiten, die nicht aus echtem Audio stammen, sondern gleichmäßig
// über die Szenendauer verteilt wurden. Solche Zeiten tragen dieselben Felder
// wie echte (reviewed, confidence), sind aber grundsätzlich nicht synchron.
//
// Die Schwellen sind an echten und künstlichen Reels dieses Repositories gemessen:
//
//   Metrik                        echtes Audio      gleichverteilt
//   Korrelation Länge/Dauer       0,654 – 0,770     -0,019 – 0,029
//   Variationskoeffizient         0,486 – 0,732      0,054 – 0,083
//   identische Nachbardauern      4 – 6 %           81 – 99 %

export const WORD_TIMING_PLAUSIBILITY = Object.freeze({
  minimumWords: 30,
  minimumLengthDurationCorrelation: 0.25,
  minimumDurationVariationCoefficient: 0.2,
  maximumIdenticalNeighbourRatio: 0.4,
  requiredTriggersForSuspicion: 2
});

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function timedWords(words) {
  return (Array.isArray(words) ? words : [])
    .map((word) => ({
      text: String(word?.text ?? word?.word ?? ''),
      startSeconds: finite(word?.startSeconds ?? word?.start),
      endSeconds: finite(word?.endSeconds ?? word?.end)
    }))
    .filter((word) => word.startSeconds !== null && word.endSeconds !== null && word.endSeconds > word.startSeconds);
}

function pearson(x, y) {
  const n = x.length;
  if (n < 2) return 0;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  let sum = 0;
  let varianceX = 0;
  let varianceY = 0;
  for (let index = 0; index < n; index += 1) {
    sum += (x[index] - meanX) * (y[index] - meanY);
    varianceX += (x[index] - meanX) ** 2;
    varianceY += (y[index] - meanY) ** 2;
  }
  return varianceX > 0 && varianceY > 0 ? sum / Math.sqrt(varianceX * varianceY) : 0;
}

export function analyzeWordTimingPlausibility(words, options = {}) {
  const settings = { ...WORD_TIMING_PLAUSIBILITY, ...options };
  const timed = timedWords(words);

  if (timed.length < settings.minimumWords) {
    return {
      evaluated: false,
      suspicious: false,
      wordCount: timed.length,
      reason: `Für die Plausibilitätsprüfung werden mindestens ${settings.minimumWords} zeitlich erfasste Wörter benötigt.`,
      triggered: [],
      thresholds: settings
    };
  }

  const durations = timed.map((word) => word.endSeconds - word.startSeconds);
  const letters = timed.map((word) => word.text.replace(/[^\p{L}\p{N}]/gu, '').length);

  const correlation = pearson(letters, durations);

  const meanDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const variationCoefficient = meanDuration > 0
    ? Math.sqrt(durations.reduce((sum, value) => sum + (value - meanDuration) ** 2, 0) / durations.length) / meanDuration
    : 0;

  let identicalNeighbours = 0;
  for (let index = 1; index < durations.length; index += 1) {
    if (Math.abs(durations[index] - durations[index - 1]) < 0.002) identicalNeighbours += 1;
  }
  const identicalNeighbourRatio = identicalNeighbours / (durations.length - 1);

  const triggered = [];
  if (correlation < settings.minimumLengthDurationCorrelation) {
    triggered.push(`Die Wortdauern hängen nicht von der Wortlänge ab (Korrelation ${correlation.toFixed(3)}, erwartet mindestens ${settings.minimumLengthDurationCorrelation}).`);
  }
  if (variationCoefficient < settings.minimumDurationVariationCoefficient) {
    triggered.push(`Die Wortdauern streuen zu wenig (Variationskoeffizient ${variationCoefficient.toFixed(3)}, erwartet mindestens ${settings.minimumDurationVariationCoefficient}).`);
  }
  if (identicalNeighbourRatio > settings.maximumIdenticalNeighbourRatio) {
    triggered.push(`${(identicalNeighbourRatio * 100).toFixed(0)} % der benachbarten Wörter sind exakt gleich lang (erlaubt sind höchstens ${(settings.maximumIdenticalNeighbourRatio * 100).toFixed(0)} %).`);
  }

  return {
    evaluated: true,
    suspicious: triggered.length >= settings.requiredTriggersForSuspicion,
    wordCount: timed.length,
    lengthDurationCorrelation: Number(correlation.toFixed(4)),
    durationVariationCoefficient: Number(variationCoefficient.toFixed(4)),
    identicalNeighbourRatio: Number(identicalNeighbourRatio.toFixed(4)),
    triggered,
    thresholds: settings
  };
}
