const GENERIC_INTRO = /\b(in diesem (video|reel)|heute (erkläre|zeigen|schauen)|willkommen|wir schauen uns|in diesem beitrag)\b/i;
const CURIOSITY_SIGNAL = /\b(warum|wieso|weshalb|wie|was|wer|wo|wann|nicht nur|tatsächlich|obwohl|aber|doch|kaum|niemand|ungewöhnlich|überrasch|mehr als|weniger als|ohne|trotz)\b/i;

function words(value) {
  return String(value ?? '').trim().match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) ?? [];
}

export function inspectReelHook({ narration = '', imageText = '' } = {}) {
  const text = String(narration ?? '').trim();
  const issues = [];
  const count = words(text).length;

  if (count < 8 || count > 28) {
    issues.push(`Hook-Narration braucht 8–28 Wörter, hat aber ${count}.`);
  }
  if (GENERIC_INTRO.test(text)) {
    issues.push('Hook startet mit einer generischen Video-Einleitung statt mit der Sache selbst.');
  }
  if (!text.includes('?') && !CURIOSITY_SIGNAL.test(text)) {
    issues.push('Hook braucht eine klare Frage, Überraschung oder einen sichtbaren Kontrast/Neugierimpuls.');
  }

  const headlineWords = words(imageText).length;
  if (headlineWords < 2 || headlineWords > 5) {
    issues.push(`Titelbild-Headline braucht 2–5 Wörter, hat aber ${headlineWords}.`);
  }

  return { passed: issues.length === 0, issues, wordCount: count };
}
