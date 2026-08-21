import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BUNDLE_DIRECTORY = 'all-image-prompts';
const BUNDLE_FILE = 'all-image-prompts.txt';

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function sceneNumber(scene, fallbackIndex) {
  const order = Number(scene?.order);
  if (Number.isInteger(order) && order > 0) return order;
  const match = String(scene?.sceneId ?? '').match(/(\d+)$/);
  return match ? Number(match[1]) : fallbackIndex + 1;
}

function normalizedRelativePath(value) {
  return value.split(path.sep).join('/');
}

function padImageNumber(value) {
  return String(value).padStart(2, '0');
}

export function getImagePromptBundlePaths(reelDirectory) {
  const directory = path.join(reelDirectory, BUNDLE_DIRECTORY);
  return {
    directory,
    file: path.join(directory, BUNDLE_FILE),
    readme: path.join(directory, 'README.md')
  };
}

export async function ensureImagePromptBundleDirectory(reelDirectory) {
  const paths = getImagePromptBundlePaths(reelDirectory);
  await mkdir(paths.directory, { recursive: true });

  const readme = `# Alle Bildprompts\n\n\`${BUNDLE_FILE}\` ist als **ein einziger Google-Flow-Gesamtauftrag mit harter serieller Sperre und autonomem Durchlauf** aufgebaut. Der Nutzer kopiert die komplette Datei genau einmal in Google Flow und sendet sie genau einmal ab. **Dieses einmalige Absenden ist bereits die Freigabe für den kompletten Durchlauf bis zum letzten Bild.** Google Flow darf danach kein weiteres \`Go\`, \`Weiter\`, keine Bestätigung und keine weitere Nutzerantwort verlangen.\n\nVerbindlich: Zu jedem Zeitpunkt ist nur **eine einzige Bildgenerierung aktiv**. Bild 00 vollständig erzeugen → auf vollständigen Abschluss warten → sofort korrekt umbenennen → prüfen, dass die Umbenennung abgeschlossen ist → **danach automatisch ohne Nutzerinteraktion Bild 01 starten**. Danach identisch Bild für Bild bis zum letzten Bild. Kein Parallelisieren, keine Warteschlange, kein Vorladen, aber ebenso **keine Pause zum Warten auf den Nutzer** zwischen zwei Bildern.\n\n**Bild 00 ist zusätzlich die verbindliche visuelle Stilvorlage für das gesamte Reel.** Das Cover enthält den sichtbaren Hook zum Reel-Thema. Alle folgenden Szenen müssen sich direkt an Bild 00 orientieren: gleicher Zeichen-/Renderstil, gleiche Farbwelt, gleiche Figurenmerkmale, gleiche Proportionen, gleiche Licht- und Detailqualität. Der Cover-Hook wird aber nur dann in einer Szene wiederholt, wenn der jeweilige Szenenprompt ausdrücklich sichtbaren Text verlangt.\n\nDirekt bei JEDEM Bildblock stehen feste Bildnummer, Ziel, Dateiname und die Freigabebedingung für diesen Schritt: Bild 00 = Cover, Bild 01 = Szene 1, Bild 02 = Szene 2 usw. Die Freigabe des nächsten Blocks erfolgt **automatisch durch die erfolgreich abgeschlossene Umbenennung des vorherigen Bildes**, niemals durch eine neue Nachricht des Nutzers.\n\nErzeugen oder aktualisieren:\n\n\`\`\`bash\nnpm run export:prompts -- --dir "${normalizedRelativePath(reelDirectory)}" --strict\n\`\`\`\n\nDie Datei wird automatisch aus \`cover/cover-prompt.txt\` und \`scenes/scene-XX/image-prompt.txt\` aufgebaut und sollte nicht manuell gepflegt werden.\n`;
  await writeFile(paths.readme, readme, 'utf8');

  if (!(await exists(paths.file))) {
    await writeFile(paths.file, 'Die Bildprompt-Sammeldatei mit Cover und Szenen wird nach Fertigstellung aller Prompts erzeugt.\n', 'utf8');
  }

  return paths;
}

export async function collectImagePrompts(reelDirectory) {
  const sceneIndexPath = path.join(reelDirectory, 'scenes', 'scene-index.json');
  if (!(await exists(sceneIndexPath))) {
    throw new Error('scenes/scene-index.json wurde nicht gefunden.');
  }

  const scenes = await readJson(sceneIndexPath);
  if (!Array.isArray(scenes) || scenes.length === 0) {
    throw new Error('scenes/scene-index.json enthält keine Szenen.');
  }

  const coverPromptPath = path.join(reelDirectory, 'cover', 'cover-prompt.txt');
  const coverPromptPresent = await exists(coverPromptPath);
  const coverPrompt = coverPromptPresent ? (await readFile(coverPromptPath, 'utf8')).trim() : '';

  const prompts = [{
    kind: 'cover',
    promptId: 'cover',
    sceneId: null,
    order: 0,
    promptPath: coverPromptPath,
    prompt: coverPrompt,
    missing: !coverPrompt
  }];

  const orderedScenes = scenes
    .map((scene, index) => ({ ...scene, resolvedOrder: sceneNumber(scene, index) }))
    .sort((a, b) => a.resolvedOrder - b.resolvedOrder);

  for (const scene of orderedScenes) {
    const promptPath = path.join(reelDirectory, 'scenes', scene.sceneId, 'image-prompt.txt');
    const present = await exists(promptPath);
    const prompt = present ? (await readFile(promptPath, 'utf8')).trim() : '';
    prompts.push({
      kind: 'scene',
      promptId: scene.sceneId,
      sceneId: scene.sceneId,
      order: scene.resolvedOrder,
      promptPath,
      prompt,
      missing: !prompt
    });
  }

  return prompts;
}

export function formatImageNumberingContract(prompts) {
  const scenes = prompts
    .filter((entry) => entry.kind === 'scene')
    .sort((a, b) => a.order - b.order);
  const lastNumber = padImageNumber(scenes.at(-1)?.order ?? 0);

  const lines = [
    'ABSCHLUSS – ERST JETZT GEMEINSAM IN EINEN ORDNER',
    '',
    'DIESER ABSCHLUSS DARF ERST BEGINNEN, WENN DAS LETZTE BILD VOLLSTÄNDIG FERTIG UND UMBENANNT IST.',
    'Vorher darf KEIN Bild in den gemeinsamen Sammelordner verschoben werden.',
    'Für diesen Abschluss ist KEIN neues Go und KEINE neue Nutzerbestätigung erforderlich. Nach dem letzten korrekt umbenannten Bild automatisch fortfahren.',
    '',
    'FESTE DATEIBENENNUNG:',
    '- Bild 00 = COVER → Dateiname `Bild 00.png`'
  ];

  for (const scene of scenes) {
    const number = padImageNumber(scene.order);
    lines.push(`- Bild ${number} = SZENE ${scene.order} → Dateiname \`Bild ${number}.png\``);
  }

  lines.push(
    '',
    `Prüfe jetzt erst die vollständige Reihe Bild 00 bis Bild ${lastNumber}: keine Nummer fehlt, keine Nummer ist doppelt und keine Nummer ist vertauscht.`,
    'Falls das Bildformat nicht PNG ist, darf nur die Dateiendung abweichen; die Nummerierung `Bild 00`, `Bild 01`, `Bild 02` usw. bleibt unverändert.',
    'ERST NACH DIESER VOLLSTÄNDIGEN PRÜFUNG: Lege ALLE fertigen und bereits korrekt umbenannten Bilder gemeinsam in `00-bildprompts/00-ALLE-BILDER-HIER-REIN/`.',
    'Alle Bilder kommen dann zusammen in genau diesen EINEN Sammelordner. Nicht vorher und nicht einzeln während der Generierung. Nicht auf einzelne Cover- oder Szenenordner verteilen.'
  );

  return lines.join('\n');
}

function formatFlowExecutionContract(prompts) {
  const scenes = prompts
    .filter((entry) => entry.kind === 'scene')
    .sort((a, b) => a.order - b.order);
  const lastNumber = padImageNumber(scenes.at(-1)?.order ?? 0);
  const total = scenes.length + 1;

  return [
    'GOOGLE FLOW – HARTE SERIELLE SPERRE + AUTONOMER DURCHLAUF – NIEMALS PARALLEL, NIEMALS AUF EIN WEITERES GO WARTEN',
    '',
    `Diese komplette Nachricht enthält ${total} Bildaufträge von Bild 00 bis Bild ${lastNumber}. Sie werden NICHT gleichzeitig und NICHT als Batch ausgeführt.`,
    'DAS EINMALIGE ABSENDEN DIESER KOMPLETTEN NACHRICHT IST DIE VOLLSTÄNDIGE FREIGABE FÜR ALLE BILDER BIS ZUM ENDE.',
    'ANTWORTE NICHT mit einer Bestätigung, Zusammenfassung oder Erklärung. Beginne ausschließlich mit BILD 00.',
    'FRAGE AB JETZT NICHT MEHR NACH GO, WEITER, BESTÄTIGUNG, FREIGABE, ERLAUBNIS ODER EINER WEITEREN NUTZERANTWORT.',
    'WARTE ZWISCHEN DEN BILDERN NIEMALS AUF EINE NACHRICHT DES NUTZERS. DIE FERTIGSTELLUNG UND KORREKTE UMBENENNUNG DES AKTUELLEN BILDES IST AUTOMATISCH DAS STARTSIGNAL FÜR DAS NÄCHSTE BILD.',
    '',
    'DIE ZWEI WICHTIGSTEN REGELN:',
    '1. ZU JEDEM ZEITPUNKT DARF GENAU EINE EINZIGE BILDGENERIERUNG AKTIV SEIN.',
    '2. SOBALD DIESE EINE GENERIERUNG FERTIG UND DAS BILD KORREKT UMBENANNT IST, MUSST DU SOFORT SELBSTSTÄNDIG MIT DEM NÄCHSTEN BILD WEITERMACHEN – OHNE NUTZERINTERAKTION.',
    'STARTE NIEMALS DAS NÄCHSTE BILD, SOLANGE DAS AKTUELLE BILD NOCH GENERIERT WIRD, NOCH NICHT VOLLSTÄNDIG FERTIG IST ODER NOCH NICHT KORREKT UMBENANNT WURDE.',
    '',
    'BILD 00 = COVER + VERBINDLICHE STILVORLAGE:',
    '- Erzeuge Bild 00 zuerst als echtes Cover des Reels.',
    '- Der im Cover-Prompt verlangte sichtbare deutsche Text ist der HOOK des Reels und muss exakt lesbar auf Bild 00 erscheinen. Er soll sofort zeigen, worum es im Reel geht.',
    '- Sobald Bild 00 fertig und als `Bild 00.png` benannt ist, verwende genau dieses fertige Cover als visuelle Referenz/Vorlage für ALLE folgenden Szenen.',
    '- Halte danach denselben Zeichen-/Renderstil, dieselbe Farbwelt, dieselben Figurenmerkmale, dieselben Proportionen, dieselbe Lichtstimmung und dieselbe Detailqualität wie auf Bild 00.',
    '- Übernimm den Cover-Hook-Text NICHT automatisch in spätere Szenen. Sichtbarer Szenentext kommt nur hinein, wenn der jeweilige Szenenprompt ihn ausdrücklich verlangt.',
    '',
    'STRENG VERBOTEN:',
    '- mehrere Bilder gleichzeitig starten',
    '- mehrere Prompts gleichzeitig absenden',
    '- spätere Bilder vorab in eine Warteschlange oder Queue legen',
    '- den nächsten Bildblock vorladen oder ausführen, während das aktuelle Bild noch läuft',
    '- alle Bildblöcke als Batch behandeln',
    '- mehrere fertige, aber noch unbenannte Bilder ansammeln',
    '- Bilder während der Generierung bereits in den gemeinsamen Sammelordner verschieben',
    '- den visuellen Stil zwischen Cover und Szenen ohne ausdrückliche Prompt-Anweisung wechseln',
    '- nach einem fertigen Bild auf `Go`, `Weiter`, `OK`, eine Bestätigung oder irgendeine andere Nutzerantwort warten',
    '- zwischen zwei Bildern eine Rückfrage stellen oder den Arbeitsablauf pausieren, obwohl das vorherige Bild erfolgreich fertig und umbenannt ist',
    '',
    'VERBINDLICHER AUTONOMER ABLAUF FÜR JEDES EINZELNE BILD:',
    'A. Lies ausschließlich den aktuellen freigegebenen Bildblock.',
    'B. Starte GENAU EINE Bildgenerierung für diesen Block.',
    'C. WARTE, bis diese eine Bildgenerierung vollständig abgeschlossen ist. Währenddessen keinerlei anderes Bild starten.',
    'D. Sobald das Bild vollständig fertig ist, benenne DIESES Bild sofort exakt mit dem angegebenen Dateinamen um.',
    'E. WARTE, bis auch die Umbenennung abgeschlossen ist, und prüfe den Dateinamen.',
    'F. Sobald diese Prüfung erfolgreich ist, ist der nächste nummerierte Bildblock AUTOMATISCH freigegeben. Es ist KEINE Nutzerantwort nötig.',
    'G. Starte den nächsten Bildblock SOFORT selbstständig. Nicht anhalten, nicht nachfragen, nicht auf ein Go warten.',
    `H. Wiederhole A bis G streng einzeln und ohne Unterbrechung bis einschließlich Bild ${lastNumber}.`,
    '',
    'BEISPIEL DER AUTOMATISCHEN KETTE:',
    'Bild 00 erzeugen → warten bis Bild 00 wirklich fertig → sofort `Bild 00.png` nennen → prüfen → Bild 00 als Stilvorlage festhalten → SOFORT AUTOMATISCH Bild 01 starten. Kein Go vom Nutzer.',
    'Bild 01 erzeugen → dabei Bild 00 als Stilreferenz verwenden → warten bis Bild 01 wirklich fertig → sofort `Bild 01.png` nennen → prüfen → SOFORT AUTOMATISCH Bild 02 starten. Kein Go vom Nutzer.',
    'Genau so einzeln und selbstständig bis zum letzten Bild. Keine Pause und keine Ausnahme.',
    '',
    `NACH BILD ${lastNumber}: Erst wenn wirklich ALLE ${total} Bilder vollständig erzeugt UND jeweils direkt nach ihrer Erzeugung korrekt umbenannt wurden, die komplette Nummerierung prüfen.`,
    'ERST DANACH alle fertigen Bilder gemeinsam in EINEN Sammelordner legen. Auch dafür KEINE neue Nutzerfreigabe verlangen.',
    '',
    'JETZT AUSFÜHREN: Starte NUR BILD 00. Danach führe die gesamte Kette selbstständig bis zum Abschluss aus. Das einmalige Absenden dieses Gesamtprompts ist bereits das einzige benötigte Go.'
  ].join('\n');
}

function formatDirectGenerationInstruction(number, previousNumber, isCover, isLast) {
  const gate = previousNumber === null
    ? 'FREIGABE: Dies ist der einzige jetzt freigegebene Bildblock. Das einmalige Absenden des Gesamtprompts ist bereits die Freigabe für die gesamte spätere Kette.'
    : `FREIGABE-BEDINGUNG: Dieser Block wird AUTOMATISCH freigegeben, sobald BILD ${previousNumber} vollständig fertig erzeugt, exakt als \`Bild ${previousNumber}.png\` umbenannt und die Umbenennung geprüft wurde. KEIN weiteres Go und KEINE Nutzerantwort abwarten.`;

  const styleInstruction = isCover
    ? [
      'COVER-REGEL: Dieses Bild ist das echte Cover UND die verbindliche visuelle Stilvorlage für das gesamte Reel.',
      'HOOK-REGEL: Der im folgenden Cover-Prompt verlangte sichtbare deutsche Text muss exakt und gut lesbar auf dem Cover erscheinen. Dieser Text ist die Hook und erklärt sofort, worum es im Reel geht.',
      'Nach Fertigstellung dieses Covers: Bild 00 als direkte Style-Referenz für alle späteren Szenen beibehalten.'
    ]
    : [
      'STYLE-REFERENZ: Verwende das bereits fertig erzeugte `Bild 00.png` direkt als verbindliche visuelle Vorlage für dieses Szenenbild.',
      'Behalte Zeichen-/Renderstil, Farbwelt, Figurenmerkmale, Proportionen, Lichtstimmung und Detailqualität von Bild 00 bei.',
      'Den Cover-Hook-Text nicht kopieren, außer der folgende Szenenprompt verlangt ausdrücklich sichtbaren Text.'
    ];

  const releaseInstruction = isLast
    ? `Dies ist das letzte Bild. Nach abgeschlossener Umbenennung von Bild ${number} den Abschluss-Schritt unten AUTOMATISCH ausführen. Keine weitere Nutzerbestätigung verlangen.`
    : 'SOBALD DIESE PRÜFUNG ERFOLGREICH IST: den direkt nächsten nummerierten Bildblock SOFORT AUTOMATISCH starten. NICHT auf `Go`, `Weiter`, `OK` oder irgendeine Nutzerantwort warten.';

  return [
    gate,
    ...styleInstruction,
    `GOOGLE FLOW – AKTUELLER EINZELSCHRITT: Erzeuge GENAU EIN Bild: BILD ${number}.`,
    'Während diese Generierung läuft: KEIN anderes Bild starten, keinen späteren Prompt absenden und nichts in eine Queue legen.',
    `Nach vollständigem Abschluss dieses Bildes: sofort exakt in \`Bild ${number}.png\` umbenennen und prüfen, dass dieser Dateiname wirklich gesetzt ist.`,
    releaseInstruction
  ].join('\n');
}

function formatDirectPromptSection(entry, index, prompts) {
  const body = entry.prompt || '[BILDPROMPT FEHLT]';
  const value = entry.kind === 'cover' ? 0 : entry.order;
  const number = padImageNumber(value);
  const previousNumber = value === 0 ? null : padImageNumber(value - 1);
  const isCover = entry.kind === 'cover';
  const isLast = index === prompts.length - 1;

  if (isCover) {
    return [
      `BILD ${number} – COVER – GOOGLE-FLOW-PROMPT`,
      'ZIEL: COVER + STYLE-VORLAGE FÜR DAS GESAMTE REEL',
      `DATEINAME: Bild ${number}.png`,
      formatDirectGenerationInstruction(number, previousNumber, true, isLast),
      '',
      body
    ].join('\n');
  }

  return [
    `BILD ${number} – SZENE ${entry.order} – GOOGLE-FLOW-PROMPT`,
    `ZIEL: SZENE ${entry.order}`,
    `DATEINAME: Bild ${number}.png`,
    formatDirectGenerationInstruction(number, previousNumber, false, isLast),
    '',
    body
  ].join('\n');
}

export function formatImagePromptBundle(prompts) {
  const sections = prompts.map((entry, index) => formatDirectPromptSection(entry, index, prompts));
  const executionContract = formatFlowExecutionContract(prompts);
  const numberingContract = formatImageNumberingContract(prompts);
  return `ALLE BILDPROMPTS – GOOGLE FLOW – STRENG EINZELN + AUTONOM OHNE WEITERES GO + COVER ALS STYLE-VORLAGE\n\n${executionContract}\n\n\n${sections.join('\n\n\n')}\n\n\n${numberingContract}\n`;
}

function missingPromptIds(prompts) {
  return prompts.filter((entry) => entry.missing).map((entry) => entry.promptId);
}

export async function buildImagePromptBundle(reelDirectory, { strict = false } = {}) {
  const paths = await ensureImagePromptBundleDirectory(reelDirectory);
  const prompts = await collectImagePrompts(reelDirectory);
  const missingIds = missingPromptIds(prompts);

  if (strict && missingIds.length > 0) {
    throw new Error(`Bildprompts fehlen für: ${missingIds.join(', ')}.`);
  }

  const content = formatImagePromptBundle(prompts);
  await writeFile(paths.file, content, 'utf8');

  const statusPath = path.join(reelDirectory, 'status.json');
  if (await exists(statusPath)) {
    const status = await readJson(statusPath);
    status.imagePromptBundle = missingIds.length === 0 ? 'ready' : 'incomplete';
    await writeFile(statusPath, `${JSON.stringify(status, null, 2)}\n`, 'utf8');
  }

  return {
    outputFile: paths.file,
    sceneCount: prompts.filter((entry) => entry.kind === 'scene').length,
    totalPromptCount: prompts.length,
    coverIncluded: prompts.some((entry) => entry.kind === 'cover' && !entry.missing),
    missingPromptIds: missingIds,
    missingSceneIds: prompts
      .filter((entry) => entry.kind === 'scene' && entry.missing)
      .map((entry) => entry.sceneId),
    complete: missingIds.length === 0,
    content
  };
}

export async function validateImagePromptBundle(reelDirectory) {
  const paths = getImagePromptBundlePaths(reelDirectory);
  const prompts = await collectImagePrompts(reelDirectory);
  const missingIds = missingPromptIds(prompts);
  const expected = formatImagePromptBundle(prompts);
  const actual = await exists(paths.file) ? await readFile(paths.file, 'utf8') : null;
  const current = actual === expected;

  return {
    passed: missingIds.length === 0 && current,
    outputFile: paths.file,
    sceneCount: prompts.filter((entry) => entry.kind === 'scene').length,
    totalPromptCount: prompts.length,
    coverIncluded: prompts.some((entry) => entry.kind === 'cover' && !entry.missing),
    missingPromptIds: missingIds,
    missingSceneIds: prompts
      .filter((entry) => entry.kind === 'scene' && entry.missing)
      .map((entry) => entry.sceneId),
    filePresent: actual !== null,
    current,
    message: missingIds.length > 0
      ? `Bildprompts fehlen für: ${missingIds.join(', ')}.`
      : !actual
        ? `Sammeldatei fehlt: ${normalizedRelativePath(paths.file)}.`
        : !current
          ? 'Die Bildprompt-Sammeldatei ist veraltet oder enthält die harte serielle Google-Flow-Sperre, den autonomen Durchlauf ohne weiteres Go und die Cover-Style-Referenz nicht vollständig.'
          : 'Die Bildprompt-Sammeldatei erzwingt Bild für Bild, läuft nach dem einmaligen Absenden ohne weitere Nutzerfreigabe autonom bis zum Ende und verwendet Bild 00 als Cover-Hook sowie verbindliche Stilvorlage.'
  };
}
