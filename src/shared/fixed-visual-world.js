export const FIXED_VISUAL_STYLE_ID = 'modern-countryball-explainer';

// Legacy technical ID retained for compatibility only. The active visual world below is human-first.
export const FIXED_VISUAL_STYLE_REASON = 'Eine feste Reel-Bildwelt für alle neuen Erklär-Reels: Human Editorial Explainer mit vereinfachten echten Menschen, klaren physischen Mini-Szenen und hoher Social-Media-Lesbarkeit.';

export const FIXED_VISUAL_WORLD_PROMPT = [
  'Create a vertical 9:16 educational explainer illustration in one fixed Human Editorial Explainer visual world made specifically for short-form Reels.',
  'The default character system is recognizably HUMAN: simplified illustrated real people with normal human heads, necks, torsos, arms, hands and legs when the shot needs them. A scene may show only a head, portrait, upper body, hands or a full body depending on the story, but the person must still read as a stylized real human and never as a ball, sphere, countryball or stick figure.',
  'Use a clean hand-drawn 2D editorial cartoon look with confident black outlines, simplified readable anatomy, flat or lightly cel-shaded colors, subtle soft shadows and at most a faint paper or grain texture. Keep detail low to medium, shapes bold and the image immediately readable on a phone.',
  'Human faces should be simple and expressive: natural oval or rounded human head shape, simple eyes, brows, nose and mouth, readable hairstyle when useful, and clear emotion without realism. Avoid oversized spherical heads that turn the character into a ball mascot.',
  'A human is NOT mandatory in every image. When the explanation is clearer without a person, use the clearest concrete object, mechanism, environment, close-up, document, map, building, plant, tool or physical process. Objects do not need faces unless anthropomorphism is genuinely useful.',
  'For countries, governments, institutions or historical actors, use human representatives, maps, flags, documents, buildings or other contextual visual storytelling. Do not use countryball characters or flag-painted balls.',
  'The priority is immediate clarity: one dominant visual idea, one clear physical action and only one to three supporting elements. The core meaning should be understandable in about one second.',
  'Build a concrete mini-scene first. The image may be simple and poster-like, but it should feel like a real moment: a person doing something, an object changing, a mechanism working, or an environment showing a consequence. Do not build the image as an icon board.',
  'Keep backgrounds simple and contextual. Use a room, street, market, desk, road, landscape, workshop, classroom, kitchen or other setting only when it helps the explanation. Avoid highly detailed interiors, dense scenery and elaborate realistic perspective.',
  'Do not let the topic create a new visual world. Aviation, engineering, science, medicine, history, politics, psychology and everyday life all use this same Human Editorial Explainer language. Technical cutaways, engineering schematics, blueprint-like cross-sections and highly detailed machinery are not the default and should appear only when the exact explanation requires them, still simplified to match this visual world.',
  'Lighting should normally be bright, clear and graphic rather than dark, moody or cinematic. Night lighting is allowed only when night itself matters to the story.',
  'Vary close-up, portrait, upper-body, full-body, off-center framing, simple wide shot and foreground/midground/background when useful, but never sacrifice instant readability for complexity.',
  'Avoid generic floating reaction cards, rings of speech bubbles, icon grids, UI-like boxes, sterile infographic layouts, repeated arrows, repeated balance scales, decorative symbol clouds and repeated centered-character-plus-icons compositions.',
  'Any visible text must be German only, short, correctly spelled and intentionally integrated. Prefer one bold readable keyword or a 1–5 word headline when text is requested. Never duplicate the same headline at both the top and bottom.',
  'If no text is requested, include no readable text at all. No English visible text, no pseudo-text, no logos, no watermark, no interface chrome and no workflow labels.',
  'Do not use photorealistic people, anime, manga, clay, glossy 3D, Pixar-like rendering, stock-photo aesthetics, painterly concept art, countryballs, spherical mascot people, thin-line stick figures or excessively detailed technical illustration.',
  'Do not borrow the separate YouTube visual world: no YouTube stick-figure/Ink-Explainer longform look and no 16:9 composition. Reels and YouTube remain fully separate.',
  'Final quality check: if the main idea is not clear almost instantly, simplify the scene. Prefer a strong human action, concrete object, direct contrast or physical cause-and-effect over technical complexity.'
].join(' ');

export const FIXED_VISUAL_WORLD_LABEL = 'Human Editorial Explainer';
