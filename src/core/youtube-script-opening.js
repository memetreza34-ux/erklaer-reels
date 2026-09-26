export function validateYoutubeScriptOpening(script, policy = {}) {
  const text = String(script ?? '').trim();
  const errors = [];

  if (!text) {
    return { passed: false, errors: ['Sprechertext ist leer.'] };
  }

  const maxQuestionChars = Number(policy.maxCharactersBeforeFirstQuestionMark) || 120;
  const openingWindowCharacters = Number(policy.openingWindowCharacters) || 420;
  const viewerThoughtPhrase = String(policy.viewerThoughtPhrase || 'Denkst du dir gerade vielleicht.');
  const shortAnswerMarkers = Array.isArray(policy.shortAnswerMarkers) && policy.shortAnswerMarkers.length > 0
    ? policy.shortAnswerMarkers
    : ['Kurz gesagt:', 'Einfach gesagt:'];

  const firstQuestionMark = text.indexOf('?');
  if (policy.directQuestionRequiredAtStart !== false) {
    if (firstQuestionMark < 0) {
      errors.push('Der Sprechertext muss direkt mit einer echten Videofrage beginnen.');
    } else if (firstQuestionMark > maxQuestionChars) {
      errors.push(`Die erste Videofrage kommt zu spät: Fragezeichen erst nach ${firstQuestionMark + 1} Zeichen, erlaubt sind höchstens ${maxQuestionChars}.`);
    }
  }

  const afterFirstQuestion = firstQuestionMark >= 0 ? text.slice(firstQuestionMark + 1).trimStart() : '';
  if (policy.viewerThoughtPhraseRequired !== false && !afterFirstQuestion.startsWith(viewerThoughtPhrase)) {
    errors.push(`Direkt nach der Videofrage muss stehen: "${viewerThoughtPhrase}"`);
  }

  const openingWindow = text.slice(0, openingWindowCharacters);
  const markerMatch = shortAnswerMarkers
    .map((marker) => ({ marker, index: openingWindow.indexOf(marker) }))
    .filter((entry) => entry.index >= 0)
    .sort((a, b) => a.index - b.index)[0];

  if (policy.shortAnswerRequired !== false && !markerMatch) {
    errors.push(`Im Einstieg fehlt die kurze Erstantwort mit ${shortAnswerMarkers.map((item) => `"${item}"`).join(' oder ')}.`);
  }

  if (policy.bridgeQuestionRequired !== false && markerMatch) {
    const secondQuestionMark = openingWindow.indexOf('?', markerMatch.index + markerMatch.marker.length);
    if (secondQuestionMark < 0) {
      errors.push('Nach der kurzen Erstantwort fehlt eine zweite Leit-/Spannungsfrage.');
    }
  }

  if (policy.abstractDefinitionLeadForbidden !== false && firstQuestionMark > 0) {
    const beforeQuestion = text.slice(0, firstQuestionMark).trim();
    const abstractLeadPatterns = [
      /gehört zu den begriffen/i,
      /^seit\s+/i,
      /^historisch\s+/i,
      /^in diesem video/i,
      /^heute geht es/i,
      /^zunächst/i
    ];
    for (const pattern of abstractLeadPatterns) {
      if (pattern.test(beforeQuestion)) {
        errors.push('Der Einstieg beginnt abstrakt statt direkt mit der Zuschauerfrage.');
        break;
      }
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    firstQuestionMark,
    openingWindow
  };
}
