/**
 * Prüft, ob ein Bildprompt seine Flaggen konkret benennt.
 *
 * Hintergrund aus dem Vetorecht-Reel: Der Prompt für die Schlussszene lautete
 * "Five flag-patterned countryballs arranged in one closed circle". Geliefert
 * wurden SECHS Bälle — USA, China, Russland, Frankreich, Deutschland und
 * Brasilien — obwohl die Narration exakt an dieser Stelle sagt, dass nur die
 * fünf Vetomächte es abschaffen können. Der Prompt für ein anderes Bild zählte
 * dieselben fünf Flaggen einzeln auf und kam korrekt zurück.
 *
 * Regel daraus: Sobald ein Prompt Flaggen verlangt, muss er sagen WELCHE.
 */

const NUMBER_WORDS = Object.freeze({
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  fifteen: 15
});

// Begriffe, an denen eine konkret benannte Flagge erkennbar ist. Die Prompts sind
// englisch; Adjektiv- und Landesform stehen beide drin, weil beide Schreibweisen
// in bestehenden Prompts vorkommen ("Russian white-blue-red bands", "United States
// stars and stripes").
const COUNTRY_TERMS = Object.freeze([
  ['usa', /\b(united states|u\.s\.a?\.?|\bUSA\b|american|stars and stripes)/i],
  ['russia', /\brussian?\b/i],
  ['china', /\bchin(a|ese)\b/i],
  ['france', /\bfren(ch)\b|\bfrance\b/i],
  ['united-kingdom', /\b(united kingdom|great britain|britain|british|union jack|union pattern)\b/i],
  ['germany', /\bgerman(y)?\b/i],
  ['italy', /\bital(y|ian)\b/i],
  ['spain', /\bspa(in|nish)\b/i],
  ['poland', /\bpol(and|ish)\b/i],
  ['brazil', /\bbrazil(ian)?\b/i],
  ['india', /\bindian?\b/i],
  ['japan', /\bjapan(ese)?\b/i],
  ['canada', /\bcanad(a|ian)\b/i],
  ['mexico', /\bmexic(o|an)\b/i],
  ['sweden', /\bswed(en|ish)\b/i],
  ['norway', /\bnorw(ay|egian)\b/i],
  ['netherlands', /\b(netherlands|dutch)\b/i],
  ['switzerland', /\bswiss\b|\bswitzerland\b/i],
  ['austria', /\baustrian?\b/i],
  ['turkey', /\bturk(ey|ish)\b/i],
  ['ukraine', /\bukrain(e|ian)\b/i],
  ['south-korea', /\bsouth korean?\b/i],
  ['north-korea', /\bnorth korean?\b/i],
  ['australia', /\baustralian?\b/i],
  ['argentina', /\bargentin(a|ian)\b/i],
  ['south-africa', /\bsouth african?\b/i],
  ['egypt', /\begypt(ian)?\b/i],
  ['greece', /\bgree(ce|k)\b/i],
  ['portugal', /\bportug(al|uese)\b/i],
  ['ireland', /\birish\b|\bireland\b/i],
  ['belgium', /\bbelgian?\b/i],
  ['denmark', /\bdan(ish|mark)\b/i],
  ['finland', /\bfinn(ish|land)\b/i]
]);

const FLAG_REQUEST = /\bflag[- ]?(pattern|patterned|patterns|design)?\b|\bflags\b/i;

// "Five flag-patterned countryballs", "5 flag balls", "three countryballs with flags"
const COUNT_BEFORE_FLAG = /\b(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen)\s+(?:large\s+|big\s+|small\s+)?(?:flag[- ]?\w*\s+)?(?:country\s?balls?|balls?)\b/i;

function parseCount(token) {
  const lower = String(token ?? '').toLowerCase();
  if (Object.hasOwn(NUMBER_WORDS, lower)) return NUMBER_WORDS[lower];
  const number = Number.parseInt(lower, 10);
  return Number.isFinite(number) ? number : null;
}

// "German text reading exactly DIE STÄNDIGEN FÜNF" ist eine Textanweisung und
// keine Flagge. Ohne dieses Ausblenden zählt jeder deutschsprachige Prompt
// Deutschland als benanntes Land mit.
const TEXT_INSTRUCTION = /\bgerman\s+(text|lettering|headline|words?|caption|type|typography|label)\b|\bin german\b/gi;

export function namedCountriesInPrompt(prompt) {
  const text = String(prompt ?? '').replace(TEXT_INSTRUCTION, ' ');
  return COUNTRY_TERMS.filter(([, pattern]) => pattern.test(text)).map(([id]) => id);
}

/**
 * @returns {{requestsFlags: boolean, requestedBallCount: number|null, namedCountries: string[], issue: string|null}}
 */
export function analyzeFlagPrompt(prompt) {
  const text = String(prompt ?? '');
  const requestsFlags = FLAG_REQUEST.test(text);
  const namedCountries = namedCountriesInPrompt(text);
  const countMatch = requestsFlags ? text.match(COUNT_BEFORE_FLAG) : null;
  const requestedBallCount = countMatch ? parseCount(countMatch[1]) : null;

  let issue = null;
  if (requestsFlags && namedCountries.length === 0) {
    issue = 'Der Prompt verlangt Flaggen, benennt aber kein einziges Land. Das Bildmodell erfindet dann Flaggen, die der Narration widersprechen.';
  } else if (requestsFlags && requestedBallCount !== null && namedCountries.length !== requestedBallCount) {
    issue = `Der Prompt verlangt ${requestedBallCount} Flaggen-Bälle, benennt aber ${namedCountries.length} Länder (${namedCountries.join(', ')}). Jede geforderte Flagge muss einzeln genannt sein.`;
  }

  return { requestsFlags, requestedBallCount, namedCountries, issue };
}
