export function validateYoutubeScriptOpening(script, policy = {}) {
  const text = String(script ?? '').trim();
  const errors = [];

  if (!text) {
    return { passed: false, errors: ['Sprechertext ist leer.'] };
  }

  const maxQuestionChars = Number(policy.maxCharactersBeforeFirstQuestionMark) || 120;
  const openingWindowCharacters = Number(policy.openingWindowCharacters) || 700;
  const viewerThoughtPhrase = String(policy.viewerThoughtPhrase || 'Denkst du dir gerade vielleicht.');
  const shortAnswerMarkers = Array.isArray(policy.shortAnswerMarkers) && policy.shortAnswerMarkers.length > 0
    ? policy.shortAnswerMarkers
    : ['Kurz gesagt:', 'Einfach gesagt:'];

  const openingWindow = text.slice(0, openingWindowCharacters);
  const firstQuestionMark = text.indexOf('?');

  // Legacy projects may still explicitly require the old direct-question pattern.
  // Current projects deliberately allow several hook forms: story/scene, striking fact,
  // conflict, paradox, moment-in-time or a direct question.
  if (policy.directQuestionRequiredAtStart === true) {
    if (firstQuestionMark < 0) {
      errors.push('Der Sprechertext muss direkt mit einer echten Videofrage beginnen.');
    } else if (firstQuestionMark > maxQuestionChars) {
      errors.push(`Die erste Videofrage kommt zu spät: Fragezeichen erst nach ${firstQuestionMark + 1} Zeichen, erlaubt sind höchstens ${maxQuestionChars}.`);
    }
  }

  const afterFirstQuestion = firstQuestionMark >= 0 ? text.slice(firstQuestionMark + 1).trimStart() : '';
  if (policy.viewerThoughtPhraseRequired === true && !afterFirstQuestion.startsWith(viewerThoughtPhrase)) {
    errors.push(`Direkt nach der Videofrage muss stehen: "${viewerThoughtPhrase}"`);
  }

  const markerMatch = shortAnswerMarkers
    .map((marker) => ({ marker, index: openingWindow.indexOf(marker) }))
    .filter((entry) => entry.index >= 0)
    .sort((a, b) => a.index - b.index)[0];

  if (policy.shortAnswerRequired === true && !markerMatch) {
    errors.push(`Im Einstieg fehlt die kurze Erstantwort mit ${shortAnswerMarkers.map((item) => `"${item}"`).join(' oder ')}.`);
  }

  if (policy.bridgeQuestionRequired === true && markerMatch) {
    const secondQuestionMark = openingWindow.indexOf('?', markerMatch.index + markerMatch.marker.length);
    if (secondQuestionMark < 0) {
      errors.push('Nach der kurzen Erstantwort fehlt eine zweite Leit-/Spannungsfrage.');
    }
  }

  if (policy.genericMetaLeadForbidden !== false) {
    const genericLeadPatterns = [
      /^in diesem video\b/i,
      /^heute (?:geht es|sprechen wir|schauen wir)\b/i,
      /^in diesem beitrag\b/i,
      /^wir schauen uns heute\b/i,
      /^wir erklären (?:heute|dir)\b/i,
      /^das thema dieses videos\b/i,
      /^zunächst (?:müssen|wollen|schauen)\b/i
    ];
    if (genericLeadPatterns.some((pattern) => pattern.test(text))) {
      errors.push('Der Einstieg beginnt mit einer generischen Video-Ansage statt mit einem inhaltlichen Hook.');
    }
  }

  if (policy.abstractDefinitionLeadForbidden !== false) {
    const abstractLeadPatterns = [
      /^[^.!?]{0,80}gehört zu den begriffen/i,
      /^[^.!?]{0,80}bezeichnet (?:man|einen|eine|das)/i,
      /^[^.!?]{0,80}ist definiert als/i,
      /^historisch (?:gesehen|betrachtet)/i
    ];
    if (abstractLeadPatterns.some((pattern) => pattern.test(text))) {
      errors.push('Der Einstieg beginnt wie eine abstrakte Definition statt mit einer konkreten, neugierig machenden Eröffnung.');
    }
  }

  if (policy.formulaicTemplateReuseForbidden === true) {
    const unresolvedTemplatePatterns = [
      /\[DIREKTE VIDEOFRAGE\]/i,
      /\[HOOK\]/i,
      /\[SEHR KURZE ERSTANTWORT\]/i,
      /\[LEITFRAGE/i,
      /\[RESTLICHES FINALES/i
    ];
    if (unresolvedTemplatePatterns.some((pattern) => pattern.test(openingWindow))) {
      errors.push('Der Sprechertext enthält noch Platzhalter aus einer Opening-Vorlage.');
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    firstQuestionMark,
    openingWindow
  };
}
