import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { validateYoutubeScriptQuality } from '../src/core/youtube-script-quality.js';

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));

function buildGoodLongformScript() {
  const opening = 'Berlin, Juni 1948. Die Zufahrtswege nach West-Berlin werden blockiert, obwohl die USA und die Sowjetunion nur wenige Jahre zuvor noch gemeinsam gegen Hitler gekämpft hatten. Genau hier wird sichtbar, warum der Kalte Krieg nicht plötzlich entstand, sondern aus Misstrauen, Sicherheitsinteressen und Machtpolitik wuchs.';
  const blocks = Array.from({ length: 18 }, (_, index) => {
    const year = 1945 + (index % 10);
    return `${year} verschärfte sich der Konflikt weiter, weil beide Seiten die Schritte des Gegners als Bedrohung deuteten. Dadurch reagierte die jeweils andere Seite mit neuen politischen oder militärischen Maßnahmen. Zum Beispiel konnten Bündnisse, Wirtschaftshilfen oder neue Waffen eine Entscheidung absichern, gleichzeitig aber neues Misstrauen erzeugen. Entscheidend war deshalb nicht nur, was geschah, sondern warum die Gegenseite darauf reagierte und welche Folge daraus entstand.`;
  });
  return `${opening}\n\n${blocks.join('\n\n')}`;
}

test('Script Quality V1 akzeptiert erklärendes, konkretes und sprechbares Langform-Skript', async () => {
  const policy = await readJson('config/youtube-channel-policy.json');
  const result = validateYoutubeScriptQuality(buildGoodLongformScript(), policy.scriptQualityPolicy, {
    topic: 'Entstehung und Verlauf des Kalten Krieges',
    title: 'Kalter Krieg: Wie aus Verbündeten Feinde wurden'
  });

  assert.equal(result.passed, true, result.errors.join('\n'));
  assert.ok(result.metrics.wordCount > 450);
  assert.ok(result.metrics.causalSignals >= 6);
  assert.ok(result.metrics.concreteSignals >= 3);
});

test('Script Quality V1 blockiert das alte Frage-Denkst-du-Kurz-gesagt-Muster', async () => {
  const policy = await readJson('config/youtube-channel-policy.json');
  const script = `Wie begann der Kalte Krieg? Denkst du dir gerade vielleicht. Kurz gesagt: USA und Sowjetunion wurden Rivalen.\n\n${buildGoodLongformScript()}`;
  const result = validateYoutubeScriptQuality(script, policy.scriptQualityPolicy, {
    topic: 'Kalter Krieg',
    title: 'Wie begann der Kalte Krieg?'
  });

  assert.equal(result.passed, false);
  assert.ok(result.errors.some((error) => /verbotene Standardfloskel|alte starre Muster/i.test(error)));
});

test('Script Quality V1 blockiert lange reine Ereignis-Aufzählung ohne Ursache und Folge', async () => {
  const policy = await readJson('config/youtube-channel-policy.json');
  const opening = 'Der Kalte Krieg prägte die zweite Hälfte des 20. Jahrhunderts und betraf zahlreiche Staaten.';
  const flat = Array.from({ length: 85 }, () => 'Die Staaten standen sich gegenüber. Es gab politische Spannungen. Die Lage blieb schwierig.').join(' ');
  const result = validateYoutubeScriptQuality(`${opening} ${flat}`, policy.scriptQualityPolicy, {
    topic: 'Kalter Krieg',
    title: 'Der Kalte Krieg erklärt'
  });

  assert.equal(result.passed, false);
  assert.ok(result.errors.some((error) => /erklärender Mehrwert|Ursache-\/Folge/i.test(error)));
});

test('Script Quality V1 verlangt den konkreten Videogegenstand früh im Einstieg', async () => {
  const policy = await readJson('config/youtube-channel-policy.json');
  const unrelatedOpening = Array.from({ length: 22 }, () => 'Eine Stadt wacht auf und niemand weiß, wie der nächste Tag aussehen wird.').join(' ');
  const script = `${unrelatedOpening} Erst sehr spät geht es um den Kalten Krieg.\n\n${buildGoodLongformScript()}`;
  const result = validateYoutubeScriptQuality(script, policy.scriptQualityPolicy, {
    topic: 'Kalter Krieg',
    title: 'Kalter Krieg erklärt'
  });

  assert.equal(result.passed, false);
  assert.ok(result.errors.some((error) => /Videogegenstand nicht früh genug/i.test(error)));
});

test('Script Quality V1 blockiert unsprechbar verschachtelte Satzstruktur', async () => {
  const policy = await readJson('config/youtube-channel-policy.json');
  const hugeSentence = 'Der Kalte Krieg entstand, weil die USA und die Sowjetunion nach dem Zweiten Weltkrieg unterschiedliche Sicherheitsinteressen verfolgten und weil beide Seiten politische Entscheidungen der jeweils anderen Seite als Gefahr interpretierten und weil daraus wiederum neue Bündnisse, wirtschaftliche Maßnahmen, militärische Planungen und weitere Reaktionen entstanden, die den Konflikt immer weiter verstärkten, obwohl ein direkter Krieg wegen der wachsenden atomaren Abschreckung für beide Seiten immer gefährlicher wurde und deshalb zunehmend vermieden werden musste.';
  const script = Array.from({ length: 14 }, (_, index) => `${1945 + index} ${hugeSentence}`).join(' ');
  const result = validateYoutubeScriptQuality(script, policy.scriptQualityPolicy, {
    topic: 'Kalter Krieg',
    title: 'Kalter Krieg erklärt'
  });

  assert.equal(result.passed, false);
  assert.ok(result.errors.some((error) => /verschachtelt|sehr lange Sätze/i.test(error)));
});

test('Phase1- und Phase3-Pipeline können Script Quality V1 nicht umgehen', async () => {
  const [packageJson, phase3, phase1Wrapper, qualityCli] = await Promise.all([
    readJson('package.json'),
    readFile('src/cli/phase3-youtube.js', 'utf8'),
    readFile('src/cli/validate-youtube-phase1.js', 'utf8'),
    readFile('src/cli/validate-youtube-script-quality.js', 'utf8')
  ]);

  assert.match(packageJson.scripts['validate:youtube-phase1'], /validate-youtube-phase1\.js/);
  assert.match(packageJson.scripts['validate:youtube-script'], /validate-youtube-script-quality\.js/);
  assert.match(phase1Wrapper, /validate-youtube-script-quality\.js/);
  assert.match(phase1Wrapper, /validate-youtube-phase1-policy\.js/);
  assert.match(phase3, /validate-youtube-phase1\.js/);
  assert.match(qualityCli, /schema < 14/);
});
