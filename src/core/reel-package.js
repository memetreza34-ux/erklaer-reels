import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { createReelWorkspace } from './workspace.js';
import { inspectReelHook } from '../shared/reel-hook-quality.js';
import { findNarrationCueStartPercent } from '../shared/image-phase-cue.js';

/**
 * Baut ein vollständiges Reel aus einem einzelnen JSON-Paket.
 *
 * Damit braucht Phase 1 keinen Schreibzugriff auf das Repository: Ein Sprachmodell
 * liefert nur strukturierten Text, und dieser Import erzeugt daraus die komplette
 * Ordnerstruktur mit Script, Szenen, Bildprompts, Effektplan, Caption und Quellen.
 */

const DENSE_IMAGE_TARGETS = {
  8: { min: 19, max: 21 },
  9: { min: 20, max: 22 },
  10: { min: 21, max: 24 }
};

function fehler(nachricht) {
  throw new Error(nachricht);
}

function text(wert) {
  return String(wert ?? '').trim();
}

function usesAdaptiveDenseV2(paket) {
  return Number(paket?.visualDensityVersion ?? 0) >= 2 || text(paket?.imageCountMode) === 'adaptive-dense-v2';
}

function soundCoverageKey(sound) {
  const targetId = text(sound?.targetId);
  return targetId || '__scene-change__';
}

function mergeSoundEffects(defaultSounds, suppliedSounds) {
  const supplied = Array.isArray(suppliedSounds) ? suppliedSounds : [];
  const suppliedKeys = new Set(supplied.map(soundCoverageKey));
  const defaults = (Array.isArray(defaultSounds) ? defaultSounds : [])
    .filter((sound) => !suppliedKeys.has(soundCoverageKey(sound)));
  return [...supplied, ...defaults];
}

export function validateReelPackage(paket) {
  const probleme = [];
  const pflicht = ['title', 'topicArea', 'caption', 'scenes', 'sources'];
  for (const feld of pflicht) {
    if (!paket?.[feld]) probleme.push(`Feld "${feld}" fehlt.`);
  }
  if (probleme.length > 0) return probleme;

  const szenen = paket.scenes;
  const denseV2 = usesAdaptiveDenseV2(paket);
  if (!Array.isArray(szenen) || szenen.length < 8 || szenen.length > 10) {
    probleme.push(`scenes braucht 8 bis 10 Einträge, hat aber ${Array.isArray(szenen) ? szenen.length : 0}.`);
  }
  if (Array.isArray(szenen) && szenen[0]) {
    const hook = inspectReelHook({ narration: szenen[0].narration, imageText: szenen[0].imageText });
    if (!hook.passed) probleme.push(`Szene 1: Hook-Gate nicht bestanden: ${hook.issues.join(' ')}`);
  }

  const caption = text(paket.caption);
  if (caption) {
    const woerter = (caption.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) ?? []).length;
    if (woerter < 60 || woerter > 130) {
      probleme.push(`Die Caption braucht 60 bis 130 Wörter, hat aber ${woerter}.`);
    }
    const ersteZeile = caption.split(/\r?\n/).map((zeile) => zeile.trim()).find(Boolean) ?? '';
    const hookWoerter = (ersteZeile.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) ?? []).length;
    if (hookWoerter < 4 || hookWoerter > 24) {
      probleme.push(`Die erste Caption-Zeile ist die Hook und braucht 4 bis 24 Wörter, hat aber ${hookWoerter}.`);
    }
    const hashtags = (caption.match(/#[\p{L}\p{N}_]+/gu) ?? []).length;
    if (hashtags < 3 || hashtags > 6) {
      probleme.push(`Die Caption braucht 3 bis 6 Hashtags, hat aber ${hashtags}.`);
    }
  }

  const quellen = Array.isArray(paket.sources) ? paket.sources : [];
  if (quellen.length < 2) {
    probleme.push('sources braucht mindestens zwei Quellen.');
  } else {
    const hosts = new Set();
    quellen.forEach((quelle, index) => {
      const nr = index + 1;
      for (const feld of ['title', 'url', 'accessed', 'type', 'supports']) {
        if (!text(quelle[feld])) probleme.push(`Quelle ${nr}: Feld "${feld}" fehlt.`);
      }
      const url = text(quelle.url);
      if (url && !url.startsWith('https://')) {
        probleme.push(`Quelle ${nr}: URL muss mit https:// beginnen.`);
      }
      if (url) {
        try {
          hosts.add(new URL(url).hostname.replace(/^www\./, ''));
        } catch {
          probleme.push(`Quelle ${nr}: URL ist keine gültige Adresse.`);
        }
      }
      if (text(quelle.supports).length < 20) {
        probleme.push(`Quelle ${nr}: "supports" muss konkret nennen, welche Aussage die Quelle stützt.`);
      }
    });
    if (hosts.size < 2) {
      probleme.push('Die Quellen müssen von mindestens zwei verschiedenen Hosts stammen.');
    }
    const typen = quellen.map((quelle) => text(quelle.type).toLowerCase()).join(' ');
    if (!/primär|offiziell|wissenschaft|studie|original/.test(typen)) {
      probleme.push('Mindestens eine Primär-, offizielle oder wissenschaftliche Quelle ist nötig.');
    }
    if (!/sekundär|fach|unabhängig|enzyklopäd|journal/.test(typen)) {
      probleme.push('Mindestens eine unabhängige Sekundär- oder Fachquelle ist nötig.');
    }
  }

  let totalImages = 0;
  (Array.isArray(szenen) ? szenen : []).forEach((szene, index) => {
    const nr = index + 1;
    if (text(szene.narration).split(/\s+/).filter(Boolean).length < 5) {
      probleme.push(`Szene ${nr}: narration fehlt oder ist zu kurz.`);
    }
    if (text(szene.visualIdea).length < 20) probleme.push(`Szene ${nr}: visualIdea fehlt oder ist zu kurz.`);
    if (text(szene.continuityNotes).length < 10) probleme.push(`Szene ${nr}: continuityNotes fehlen.`);

    const bilder = szene.images;
    if (!Array.isArray(bilder) || bilder.length === 0) {
      probleme.push(`Szene ${nr}: images fehlt.`);
    } else {
      totalImages += bilder.length;
      if (denseV2) {
        if (index === 0 && bilder.length !== 2) {
          probleme.push(`Szene 1: Adaptive Dense V2 braucht genau 2 Hook-Bilder, geliefert ${bilder.length}.`);
        }
        if (index > 0 && (bilder.length < 2 || bilder.length > 3)) {
          probleme.push(`Szene ${nr}: Adaptive Dense V2 braucht 2 oder 3 Bilder, geliefert ${bilder.length}.`);
        }
      } else {
        const erwartet = index === 0 ? 1 : 2;
        if (bilder.length !== erwartet) {
          probleme.push(`Szene ${nr}: Legacy-Dichte erwartet ${erwartet} Bild(er), geliefert ${bilder.length}.`);
        }
      }

      bilder.forEach((bild, bildIndex) => {
        if (bildIndex > 0) {
          const phaseCue = text(bild.audioCue);
          const cueStart = findNarrationCueStartPercent(szene.narration, phaseCue);
          if (!phaseCue) {
            probleme.push(`Szene ${nr}, Bild ${bildIndex + 1}: audioCue fehlt. Der Bildwechsel muss an gesprochenen Wörtern hängen.`);
          } else if (cueStart === null) {
            probleme.push(`Szene ${nr}, Bild ${bildIndex + 1}: audioCue "${phaseCue}" kommt in der Narration nicht vor.`);
          }
        }
        if (text(bild.prompt).length < 180) {
          probleme.push(`Szene ${nr}, Bild ${bildIndex + 1}: prompt fehlt oder ist unter 180 Zeichen.`);
        }

        const bildText = text(bild.imageText);
        const istCover = index === 0 && bildIndex === 0;
        if (istCover && !bildText) {
          probleme.push('Szene 1, Bild 1: imageText fehlt. Das Cover braucht eine starke deutsche Headline.');
        }
        if (bildText) {
          const woerter = bildText.split(/\s+/).filter(Boolean).length;
          const maximum = istCover ? 7 : 4;
          if (woerter > maximum) {
            probleme.push(`Szene ${nr}, Bild ${bildIndex + 1}: imageText hat ${woerter} Wörter, erlaubt sind höchstens ${maximum}.`);
          }
        }
      });
    }
  });

  if (denseV2 && Array.isArray(szenen) && DENSE_IMAGE_TARGETS[szenen.length]) {
    const ziel = DENSE_IMAGE_TARGETS[szenen.length];
    if (totalImages < ziel.min || totalImages > ziel.max) {
      probleme.push(`Adaptive Dense V2: Bei ${szenen.length} Szenen sind ${ziel.min} bis ${ziel.max} Bilder vorgesehen; geliefert ${totalImages}.`);
    }
  }

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
  const denseV2 = usesAdaptiveDenseV2(paket);
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

  const index = await lesen(path.join('scenes', 'scene-index.json'));
  const basisEffektplan = await lesen(path.join('effects', 'effects-plan.json'));
  const basisEffektByScene = new Map((basisEffektplan.scenes ?? []).map((szene) => [szene.sceneId, szene]));
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
    szene.imagePhases = bilder.map((bild, j) => {
      const phaseCue = j === 0 ? szene.audioCue : text(bild.audioCue);
      const cueStart = j === 0 ? 0 : findNarrationCueStartPercent(quelle.narration, phaseCue);
      return {
        ...szene.imagePhases[j],
        phaseId: `${szene.sceneId}-image-${String(j + 1).padStart(2, '0')}`,
        order: j + 1,
        startPercent: j === 0 ? 0 : cueStart,
        audioCue: phaseCue,
        timingBasis: j === 0 ? 'scene-start' : 'narration-audio-cue',
        promptFileName: j === 0 ? 'image-prompt.txt' : `image-prompt-${String(j + 1).padStart(2, '0')}.txt`,
        expectedImageFileName: j === 0 ? `${szene.sceneId}.png` : `${szene.sceneId}-${j + 1}.png`,
        visualIdea: text(bild.visualIdea) || szene.visualIdea,
        imageText: text(bild.imageText),
        rationale: text(bild.rationale) || 'Eigener Bildmoment für diesen gesprochenen Satzteil.',
        imageStatus: 'missing',
        assetVerification: null
      };
    });
    szene.imageCount = szene.imagePhases.length;

    const basis = basisEffektByScene.get(szene.sceneId) ?? {};
    effektSzenen.push({
      ...basis,
      sceneId: szene.sceneId,
      transitionIn: basis.transitionIn ?? { type: i === 0 ? 'none' : 'cut', durationSeconds: 0 },
      cameraMotion: quelle.cameraMotion ?? basis.cameraMotion ?? { type: i === 0 ? 'subtle-push-in' : 'ken-burns' },
      soundEffects: mergeSoundEffects(basis.soundEffects, quelle.soundEffects)
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

  basisEffektplan.scenes = effektSzenen;
  await schreibenJson(path.join('effects', 'effects-plan.json'), basisEffektplan);

  await writeFile(path.join(verzeichnis, 'caption', 'caption.txt'), `${text(paket.caption)}\n`, 'utf8');
  await writeFile(path.join(verzeichnis, 'sources', 'sources.md'), quellenMarkdown(paket.sources), 'utf8');
  for (const datei of ['raw-script.txt', 'final-script.txt', 'voice-script.txt']) {
    await writeFile(path.join(verzeichnis, 'script', datei), `${skript}\n`, 'utf8');
  }

  const reel = await lesen('reel.json');
  reel.topicArea = text(paket.topicArea);
  reel.plannedImageCount = index.reduce((summe, szene) => summe + szene.imagePhases.length, 0);
  reel.imagePhaseTimingMode = 'narration-audio-cue';
  reel.imageCountMode = denseV2 ? 'adaptive-dense-v2' : 'one-hook-two-standard';
  reel.visualDensityVersion = denseV2 ? 2 : 1;
  await schreibenJson('reel.json', reel);

  return {
    reelDirectory: verzeichnis,
    sceneCount: index.length,
    plannedImageCount: reel.plannedImageCount,
    imageCountMode: reel.imageCountMode,
    wordCount: skript.split(/\s+/).filter(Boolean).length
  };
}
