function tokens(value) {
  return String(value ?? '').trim().match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) ?? [];
}

export function findNarrationCueStartPercent(narration, audioCue) {
  const narrationTokens = tokens(narration).map((token) => token.toLocaleLowerCase('de-DE'));
  const cueTokens = tokens(audioCue).map((token) => token.toLocaleLowerCase('de-DE'));

  if (!narrationTokens.length || !cueTokens.length || cueTokens.length > narrationTokens.length) {
    return null;
  }

  outer:
  for (let index = 0; index <= narrationTokens.length - cueTokens.length; index += 1) {
    for (let offset = 0; offset < cueTokens.length; offset += 1) {
      if (narrationTokens[index + offset] !== cueTokens[offset]) continue outer;
    }
    return Number((index / narrationTokens.length).toFixed(6));
  }

  return null;
}
