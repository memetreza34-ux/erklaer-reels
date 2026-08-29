import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { createReelWorkspace } from './workspace.js';

/**
 * Baut ein vollständiges Reel aus einem einzelnen JSON-Paket.
 *
 * Damit braucht Phase 1 keinen Schreibzugriff auf das Repository: Ein Sprachmodell
 * liefert nur strukturierten Text, und dieser Import erzeugt daraus die komplette
 * Ordnerstruktur mit Script, Szenen, Bildprompts, Effektplan, Caption und Quellen.
 */

function fehler(nachricht) {
  throw new Error(nachricht);
}

function text(wert) {
  return String(wert ?? '').trim();
}

export function validateReelPackage(paket) {
  const probleme = [];
  const pflicht = ['title', 'topicArea', 'caption', 'scenes', 'sources'];
  for (const feld of pflicht) {
    if (!paket?.[feld]) probleme.push(`Feld "${feld}" fehlt.`);
  }
  if (probleme.length > 0) return probleme;

  const szenen = paket.scenes;
  if (!Array.isArray(szenen) || szenen.length < 8 || szenen.length > 10) {
    probleme.push(`scenes braucht 8 bis 10 Einträge, hat aber ${Array.isArray(szenen) ? szenen.length : 0}.`);
  }
  if (!Array.isArray(paket.sources) || paket.sources.length < 2) {
    probleme.push('sources braucht mindestens zwei Quellen.');
  }

  (Array.isArray(szenen) ? szenen : []).forEach((szene, index) => {
    const nr = index + 1;
    if (text(szene.narration).split(/\s+/).filter(Boolean).length < 5) {
      probleme.push(`Szene ${nr}: narration fehlt oder ist zu kurz.`);
    }
    if (text(szene.visualIdea).length < 20) probleme.push(`Szene ${nr}: visualIdea fehlt oder ist zu kurz.`);
    if (text(szene.continuityNotes).length < 10) probleme.push(`Szene ${nr}: continuityNotes fehlen.`);

    const bilder = szene.images;
    const erwartet = index === 0 ? 1 : 2;
    if (!Array.isArray(bilder) || bilder.length === 0) {
      probleme.push(`Szene ${nr}: images fehlt.`);
    } else {
      if (bilder.length !== erwartet) {
        probleme.push(`Szene ${nr}: erwartet ${erwartet} Bild(er), geliefert ${bilder.length}.`);
      }
      bilder.forEach((bild, bildIndex) => {
        if (text(bild.prompt).length < 180) {
          probleme.push(`Szene ${nr}, Bild ${bildIndex + 1}: prompt fehlt oder ist unter 180 Zeichen.`);
        }
      });
    }
  });

  // Dieselben Endregeln wie in der Inhaltskontrolle, nur früher: So erfährt Phase 1
  // schon beim Schreiben, dass ein Abschluss fehlt, statt erst nach dem Anlegen.
  const letzteZwei = (Array.isArray(szenen) ? szenen : []).slice(-2);
  if (letzteZwei.length === 2) {
    const endText = letzteZwei.map((szene) => text(szene.narration)).join(' ');
    if (!/\?|würdest|frag|prüf|entscheide|entscheidung/i.test(endText)) {
      probleme.push('Die letzten zwei Szenen brauchen eine Prüf-, Erkenntnis- oder Entscheidungsfrage.');
    }
    if (text(letzteZwei[0].visualIdea) === text(letzteZwei[1].visualIdea)) {
      probleme.push('Prüffrage und Abschluss brauchen zwei unterschiedliche visualIdea.');
    }
  }

  const gesamtWorte = (Array.isArray(szenen) ? szenen : [])
    .map((szene) => text(szene.narration).split(/\s+/).filter(Boolean).length)
    .reduce((summe, wert) => summe + wert, 0);
  if (gesamtWorte < 155 || gesamtWorte > 175) {
    probleme.push(`Die Narrationen ergeben ${gesamtWorte} Wörter; nötig sind 155 bis 175.`);
  }

  return probleme;
}

function quellenMarkdown(quellen) {
  const zeilen = ['# Quellen', '<!-- sources-schema:3 -->', ''];
  quellen.forEach((quelle, index) => {
    zeilen.push(`## Quelle ${index + 1}`);
    zeilen.push(`- Titel/Institution: ${text(quelle.title)}`);
    zeilen.push(`- URL: ${text(quelle.url)}`);
    zeilen.push(`- Datum/Zugriff: ${text(quelle.accessed)}`);
    zeilen.push(`- Quellentyp: ${text(quelle.type)}`);
    zeilen.push(`- Belegt: ${text(quelle.supports)}`);
    zeilen.push('');
  });
  return zeilen.join('\n');
}

export async function importReelPackage(paket, { outputRoot = 'reels', date = new Date() } = {}) {
  const probleme = validateReelPackage(paket);
  if (probleme.length > 0) fehler(`Paket unvollständig:\n- ${probleme.join('\n- ')}`);

  const szenen = paket.scenes;
  const skript = szenen.map((szene) => text(szene.narration)).join(' ');

  const ergebnis = await createReelWorkspace({
    title: text(paket.title),
    script: skript,
    date,
    sceneCount: szenen.length,
    outputRoot
  });

  const verzeichnis = ergebnis.reelDirectory;
  const lesen = async (relativ) => JSON.parse(await (await import('node:fs/promises')).readFile(path.join(verzeichnis, relativ), 'utf8'));
  const schreibenJson = async (relativ, wert) => {
    await mkdir(path.dirname(path.join(verzeichnis, relativ)), { recursive: true });
    await writeFile(path.join(verzeichnis, relativ), `${JSON.stringify(wert, null, 2)}\n`, 'utf8');
  };

  // Szenen füllen
  const index = await lesen(path.join('scenes', 'scene-index.json'));
  const effektSzenen = [];

  index.forEach((szene, i) => {
    const quelle = szenen[i];
    szene.narration = text(quelle.narration);
    szene.imageText = text(quelle.imageText);
    szene.visualIdea = text(quelle.visualIdea);
    szene.continuityNotes = text(quelle.continuityNotes);
    szene.audioCue = text(quelle.audioCue) || text(quelle.narration).split(/\s+/).slice(0, 3).join(' ');
    if (Number.isFinite(Number(quelle.durationSeconds))) szene.durationSeconds = Number(quelle.durationSeconds);

    const bilder = quelle.images;
    szene.imagePhases = bilder.map((bild, j) => ({
      ...szene.imagePhases[j],
      phaseId: `${szene.sceneId}-image-${String(j + 1).padStart(2, '0')}`,
      order: j + 1,
      startPercent: Number.isFinite(Number(bild.startPercent)) ? Number(bild.startPercent) : (j === 0 ? 0 : 0.5),
      promptFileName: j === 0 ? 'image-prompt.txt' : `image-prompt-${String(j + 1).padStart(2, '0')}.txt`,
      expectedImageFileName: j === 0 ? `${szene.sceneId}.png` : `${szene.sceneId}-${j + 1}.png`,
      visualIdea: text(bild.visualIdea) || szene.visualIdea,
      imageText: text(bild.imageText),
      rationale: text(bild.rationale) || 'Eigener Bildmoment für diesen Satzteil.',
      imageStatus: 'missing',
      assetVerification: null
    }));
    szene.imageCount = szene.imagePhases.length;

    effektSzenen.push({
      sceneId: szene.sceneId,
      transitionIn: { type: i === 0 ? 'none' : 'cut', durationSeconds: 0 },
      cameraMotion: quelle.cameraMotion ?? { type: i === 0 ? 'none' : 'ken-burns' },
      soundEffects: Array.isArray(quelle.soundEffects) ? quelle.soundEffects : []
    });
  });

  await schreibenJson(path.join('scenes', 'scene-index.json'), index);
  for (const szene of index) {
    await schreibenJson(path.join('scenes', szene.sceneId, 'scene.json'), szene);
    for (const phase of szene.imagePhases) {
      const bild = szenen[szene.order - 1].images[phase.order - 1];
      await writeFile(path.join(verzeichnis, 'scenes', szene.sceneId, phase.promptFileName), `${text(bild.prompt)}\n`, 'utf8');
    }
  }

  // Effektplan, Caption, Quellen, Script
  const effektplan = await lesen(path.join('effects', 'effects-plan.json'));
  effektplan.scenes = effektSzenen;
  await schreibenJson(path.join('effects', 'effects-plan.json'), effektplan);

  await writeFile(path.join(verzeichnis, 'caption', 'caption.txt'), `${text(paket.caption)}\n`, 'utf8');
  await writeFile(path.join(verzeichnis, 'sources', 'sources.md'), quellenMarkdown(paket.sources), 'utf8');
  for (const datei of ['raw-script.txt', 'final-script.txt', 'voice-script.txt']) {
    await writeFile(path.join(verzeichnis, 'script', datei), `${skript}\n`, 'utf8');
  }

  const reel = await lesen('reel.json');
  reel.topicArea = text(paket.topicArea);
  reel.plannedImageCount = index.reduce((summe, szene) => summe + szene.imagePhases.length, 0);
  await schreibenJson('reel.json', reel);

  return {
    reelDirectory: verzeichnis,
    sceneCount: index.length,
    plannedImageCount: reel.plannedImageCount,
    wordCount: skript.split(/\s+/).filter(Boolean).length
  };
}
