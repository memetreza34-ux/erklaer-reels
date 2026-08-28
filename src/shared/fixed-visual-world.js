export const FIXED_VISUAL_STYLE_ID = 'human-head-editorial-reel';

export const FIXED_VISUAL_STYLE_REASON = 'Eine einzige feste Reel-Bildwelt für alle neuen Erklär-Reels: Human Head Editorial Reel mit vereinfachten, eindeutig menschlichen Figuren, klaren physischen Mini-Szenen und hoher Social-Media-Lesbarkeit.';

export const FIXED_VISUAL_WORLD_PROMPT = [
  'Create a vertical 9:16 educational explainer illustration in exactly ONE fixed Reel visual world called Human Head Editorial Reel.',
  'This same visual world is mandatory for every Reel and every topic. Never create a second style, topic-specific sub-world, engineering world, history world, medical world, countryball world or cinematic world.',
  'When a PERSON appears, the person must be a recognizably human illustrated person: a natural oval or softly rounded human head, visible neck when the framing shows it, normal simplified human torso and limbs, and simple human facial features such as eyes, brows, nose, mouth and hair when useful.',
  'The human-head look is the character anchor. Heads may be slightly simplified or editorially emphasized for readability, but they must still look like real human heads attached to human anatomy, never like balls, spheres, countryballs, mascot orbs or stick figures.',
  'A scene may show only a human head, a portrait, head and upper body, hands, or a full human body depending on what explains the moment best. Do not force a full body when a head or portrait communicates the idea more clearly.',
  'A human is NOT mandatory in every image. If the explanation is clearer without a person, use the clearest concrete object, mechanism, environment, close-up, document, map, building, plant, tool or physical process. Do not add a decorative human just to satisfy the style.',
  'Use a clean hand-drawn 2D editorial cartoon look with confident black outlines, simple readable anatomy and shapes, flat or lightly cel-shaded colors, subtle soft shadows and at most a faint paper or grain texture. Keep detail low to medium and make the image immediately readable on a phone.',
  'Build a concrete physical mini-scene first: a human doing something, an object changing, a mechanism working, or an environment showing a consequence. Do not build an icon board around a centered character.',
  'Keep backgrounds simple and contextual. Use a room, street, market, desk, road, landscape, workshop, classroom, kitchen or other setting only when it improves understanding. Avoid dense realistic scenery and elaborate perspective for decoration.',
  'For countries, governments, institutions or historical actors, use recognizable human representatives, maps, flags, documents, buildings or contextual objects. Never use countryballs or flag-painted balls.',
  'The priority is immediate clarity: one dominant visual idea, one clear physical action or cause-and-effect relationship and only one to three supporting elements. The core meaning should be understandable in about one second.',
  'The topic changes only the subject matter, never the visual world. Aviation, engineering, science, medicine, history, politics, psychology, nutrition and everyday life all stay inside this same Human Head Editorial Reel language.',
  'Technical cutaways, engineering schematics, blueprint-like cross-sections and highly detailed machinery are not the default. Use simplified technical detail only when the exact explanation cannot be understood without it.',
  'Lighting should normally be bright, clear and graphic rather than dark, moody or cinematic. Night lighting is allowed only when night itself matters to the story.',
  'Vary head close-up, portrait, upper-body, full-body, object close-up, off-center framing and simple wide shot when useful, while preserving the same line weight, human-face logic, color treatment and overall visual DNA.',
  'Avoid generic floating reaction cards, rings of speech bubbles, icon grids, UI-like boxes, sterile infographic layouts, decorative symbol clouds, repeated arrows, repeated balance scales and repeated centered-character-plus-icons compositions.',
  'Any visible text must be German only, short, correctly spelled and intentionally integrated. Prefer one bold readable keyword or a 1–5 word headline when text is requested. Never duplicate the same headline at both the top and bottom.',
  'If no text is requested, include no readable text at all. No English visible text, pseudo-text, logos, watermark, interface chrome, workflow labels, image numbers or filenames.',
  'Do not use countryballs, spherical mascot people, stick figures, photorealistic people, anime, manga, clay, glossy 3D, Pixar-like rendering, stock-photo aesthetics, painterly concept art or excessively detailed technical illustration.',
  'Do not borrow the separate YouTube visual world: no YouTube stick-figure or Ink-Explainer longform look and no 16:9 composition. Reels and YouTube remain completely separate.',
  'Final quality check: if a person appears, they must immediately read as a stylized real human. If no person is needed, do not force one. If the main idea is not clear almost instantly, simplify the scene.'
].join(' ');

export const FIXED_VISUAL_WORLD_LABEL = 'Human Head Editorial Reel';
