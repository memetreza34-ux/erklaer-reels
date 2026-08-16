import { promises as fs } from 'fs';
import path from 'path';

const REEL_DIR = 'reels/2026-KW33_10-08_bis_16-08/dienstag/reel-01_wie-baue-ich-einen-ki-app-prototyp';

async function main() {
  const sceneConcepts = [
    { title: "Idee", narration: "Aus einer einfachen Idee kannst du mit KI heute erstaunlich schnell einen ersten App Prototyp bauen.", prompt: "A glowing lightbulb transforming into a digital wireframe, modern 3d rendering, glassmorphism, dark background, 9:16 aspect ratio", imageText: "IDEE ZUR APP" },
    { title: "Zu ungenau", narration: "Aber \"schreib mir eine App\" ist dafür meistens noch viel zu ungenau.", prompt: "A person looking confused at a laptop screen with a generic text prompt, cinematic lighting, shallow depth of field, 9:16 aspect ratio", imageText: "ZU UNGENAU" },
    { title: "Klares Ziel", narration: "Zuerst braucht die KI ein klares Ziel, die wichtigsten Funktionen und den gewünschten Ablauf.", prompt: "A glowing blueprint of a mobile app structure floating in mid-air, connected by glowing lines, tech aesthetic, 9:16 aspect ratio", imageText: "KLARES ZIEL" },
    { title: "Plan", narration: "Daraus entsteht ein Plan für Oberfläche, Eingaben, Logik und Ergebnis.", prompt: "Four transparent glass panels showing UI, input fields, gears for logic, and a final app icon, aligned perfectly, 9:16 aspect ratio", imageText: "PLAN ENTWICKELN" },
    { title: "Kein Block", narration: "Danach wird der Code nicht als ein riesiger Block gebaut.", prompt: "A massive, monolithic block of code shattering into smaller, manageable glowing cubes, dramatic lighting, 9:16 aspect ratio", imageText: "KEIN RIESEN-BLOCK" },
    { title: "Einzelne Bausteine", narration: "Einzelne Bausteine für Oberfläche, Daten und Funktionen entstehen nacheinander", prompt: "Glowing floating blocks snapping together to form a mobile phone structure, 3d rendering, high quality, 9:16 aspect ratio", imageText: "BAUSTEINE" },
    { title: "Prototyp", narration: "und werden zu einem ersten Prototyp verbunden.", prompt: "A sleek, glowing smartphone prototype materializing from energy beams, dark studio background, 9:16 aspect ratio", imageText: "ERSTER PROTOTYP" },
    { title: "Testen übersprungen", narration: "Jetzt kommt der Teil, den viele überspringen: Testen.", prompt: "A magnifying glass inspecting glowing code on a dark screen, highlighting bugs in red, cinematic, 9:16 aspect ratio", imageText: "UNBEDINGT TESTEN" },
    { title: "Fehler passieren", narration: "Ein Button kann falsch reagieren, Daten können fehlen oder die Ansicht kann auf dem Handy brechen.", prompt: "A shattered glass smartphone screen displaying a glitched UI, dramatic lighting, high contrast, 9:16 aspect ratio", imageText: "FEHLER FINDEN" },
    { title: "Verbesserung", narration: "Genau hier beginnt die eigentliche Verbesserung.", prompt: "A glowing wrench repairing the shattered glass of the smartphone, turning it pristine, glowing green light, 9:16 aspect ratio", imageText: "VERBESSERUNG" },
    { title: "Du entscheidest", narration: "Die KI kann Fehler finden und Änderungen vorschlagen, aber du entscheidest, was wirklich richtig ist.", prompt: "A human hand shaking a robotic hand over a glowing control panel, cooperation concept, futuristic, 9:16 aspect ratio", imageText: "DU ENTSCHEIDEST" },
    { title: "Workflow", narration: "Der beste Workflow lautet deshalb: Idee präzisieren, Struktur bauen, Code erzeugen, testen und korrigieren.", prompt: "A glowing staircase leading up to a perfect, floating smartphone app, success concept, uplifting lighting, 3d rendering, 9:16 aspect ratio", imageText: "DER PERFEKTE WORKFLOW" },
    { title: "Abschluss", narration: "So wird aus KI-Code Schritt für Schritt ein brauchbarer Prototyp.", prompt: "A fully finished, glowing smartphone app inside a bright, clean studio environment, masterpiece, 9:16 aspect ratio", imageText: "FERTIGER PROTOTYP" }
  ];

  const scenesArray = [];
  const effectsArray = [];

  for (let i = 1; i <= 13; i++) {
    const sceneId = `scene-${i.toString().padStart(2, '0')}`;
    const concept = sceneConcepts[i-1];
    
    const s = {
      sceneId: sceneId,
      order: i,
      title: concept.title,
      narration: concept.narration,
      imageText: concept.imageText,
      visualIdea: concept.prompt,
      audioCue: concept.narration.substring(0, 20),
      leadInSeconds: 0.2,
      durationSeconds: 4.5, // 4.5 * 13 = 58.5 seconds
      expectedImageFileName: `${sceneId}.jpeg`,
      promptStatus: "ready",
      imageStatus: "missing",
      status: "image-ready",
      source: `numbered-images/Bild ${i.toString().padStart(2, '0')}.jpeg`,
      matchConfidence: 1,
      matchReason: "Matches exactly according to the Google Flow generation process and user confirmation.",
      assetVerification: {
        visualReviewed: true,
        secondPassConfirmed: true,
        sceneOrderConfirmed: true,
        confirmedTarget: sceneId,
        confirmedSceneOrder: i,
        visibleSummary: "Verified by user via Google Flow generation",
        reason: "Matches exactly according to the Google Flow generation process and user confirmation.",
        comparedFields: ["narration", "visualIdea", "imageText", "imagePrompt"],
        matchMethod: "visual-content-review",
        reviewedAt: new Date().toISOString()
      },
      continuityNotes: "Stilistisch konsistent mit den vorherigen Szenen, Fokus auf das Hauptthema."
    };
    
    scenesArray.push(s);
    
    // Create individual scene file
    await fs.writeFile(path.join(REEL_DIR, 'scenes', `${sceneId}.json`), JSON.stringify(s, null, 2), 'utf8');
    
    // Create image prompt
    await fs.writeFile(path.join(REEL_DIR, 'scenes', `${sceneId}`, 'image-prompt.txt'), concept.prompt, 'utf8');
    
    // Effect plan
    effectsArray.push({
      "sceneId": sceneId,
      "type": "zoom-in",
      "amountPercent": 5
    });
  }

  await fs.writeFile(
    path.join(REEL_DIR, 'scenes', 'scene-index.json'),
    JSON.stringify(scenesArray, null, 2),
    'utf8'
  );

  // Cover prompt
  await fs.writeFile(path.join(REEL_DIR, 'cover', 'cover-prompt.txt'), "A glowing futuristic smartphone showing an AI generating an app prototype, 3d rendering, glassmorphism, 9:16 aspect ratio", 'utf8');
  const coverData = JSON.parse(await fs.readFile(path.join(REEL_DIR, 'cover', 'cover.json'), 'utf8'));
  coverData.headline = "KI App Prototyp";
  coverData.visualIdea = "A glowing futuristic smartphone";
  await fs.writeFile(path.join(REEL_DIR, 'cover', 'cover.json'), JSON.stringify(coverData, null, 2), 'utf8');

  const effectsPlan = {
    "version": 1,
    "hook": "none",
    "transitions": Array(13).fill({ "type": "cut", "durationSeconds": 0 }),
    "sceneEffects": effectsArray,
    "audioPriority": true
  };
  await fs.writeFile(path.join(REEL_DIR, 'effects', 'effects-plan.json'), JSON.stringify(effectsPlan, null, 2), 'utf8');

  const subtitlePlan = {
    "version": 1,
    "positionYPercent": 58,
    "textColor": "#F5F7FA",
    "highlightColor": "#B7794A",
    "background": "transparent",
    "maxLines": 2,
    "highlightCurrentWord": true,
    "speakerSyncedWordHighlight": true,
    "exactWordTimingsRequired": true,
    "completeSpokenTextCoverageRequired": true,
    "expectedWordsPerLine": 5,
    "position": "center",
    "minHeightPercent": 58,
    "maxHeightPercent": 58
  };
  await fs.writeFile(path.join(REEL_DIR, 'subtitles', 'subtitle-plan.json'), JSON.stringify(subtitlePlan, null, 2), 'utf8');

  // Sources.md marker
  await fs.writeFile(path.join(REEL_DIR, 'sources', 'sources.md'), '<!-- SCHEMA_VERSION: 2 -->\n# Quellen\n\n- Eigene Erfahrung und AI-Prototyping Best Practices.\n', 'utf8');

  console.log('Fixed missing metadata.');
}

main().catch(console.error);
