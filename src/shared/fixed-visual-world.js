/**
 * Reel-Bildwelt (9:16).
 *
 * ID und Label kommen aus config/visual-worlds.json und werden hier nicht mehr
 * eigenständig definiert. Die YouTube-Welt liegt getrennt in
 * src/shared/youtube-visual-world.js und darf hier niemals einfließen.
 */

import { getVisualWorld } from './visual-worlds.js';

const REEL_WORLD = getVisualWorld('reel');

export const REEL_VISUAL_CHANNEL = 'reel';

export const FIXED_VISUAL_STYLE_ID = REEL_WORLD.id;

export const FIXED_VISUAL_WORLD_LABEL = REEL_WORLD.label;

export const FIXED_VISUAL_ASPECT_RATIO = REEL_WORLD.aspectRatio;

export const FIXED_VISUAL_STYLE_REASON = 'Globale feste Bildwelt für alle neuen Erklär-Reels: seriöse, cleane, minimalistische 2D-Countryball-Bildsprache mit starken schwarzen Konturen, einfachen Farbfeldern, kurzen deutschen Headlines und wenigen passenden Requisiten. Die alte Modern-Countryball-Explainer-Welt ist für neue Reels ersetzt.';

/**
 * Kompakter World-Lock, der vor JEDEN einzelnen Bildprompt gesetzt wird.
 *
 * Google Flow arbeitet seriell: Jeder Prompt wird einzeln kopiert, deshalb muss die
 * Bildwelt in jedem Prompt stehen. Der vollstaendige FIXED_VISUAL_WORLD_PROMPT ist dafuer
 * aber zu lang - bei 24 Bildern standen 120.000 Zeichen Stilanweisung gegen 9.000 Zeichen
 * Motiv, sodass das eigentliche Bildmotiv untergeht.
 *
 * Dieser Block enthaelt alles, was auf das EINZELNE Bild wirkt: Format, Rendering,
 * Figurenlogik, Textregeln und saemtliche harten Verbote. Weggelassen sind nur die
 * Reel-uebergreifenden Planungsregeln (Kompositionsrotation ueber mehrere Bilder,
 * World-Lock-Anweisung vor Bild 01, Selbstpruefung am Ende) - die stehen weiterhin
 * vollstaendig einmal am Kopf der Sammeldatei.
 */
export const FIXED_VISUAL_WORLD_COMPACT_PROMPT = [
  'Vertical 9:16 educational explainer image in the fixed Reel visual world Serious Minimal Countryball Explainer.',
  'Clean serious minimal flat 2D illustration with thick clean black outlines, simple readable shapes, controlled flat colours, very light graphic shading and low-to-medium detail.',
  'Background is a solid or muted colour field, a subtle gradient or light paper grain. At most one simple contextual structure when it genuinely helps. Never a detailed realistic room.',
  'Background colours come ONLY from this fixed Reel palette and nothing else: deep navy #222C4C, warm cream #FAF3DC, slate blue-grey #8A9FA6, muted sage #8AB0A8, warm clay #A08878. Pick the one that fits the moment, keep it flat, and never invent a new background hue.',
  'If an actor is useful, use a large perfectly round countryball-like character with simple white eyes and a restrained black-line expression. No separate human head, neck, hair or face. A character is optional when an object or symbol is clearer.',
  'Use flag patterns only when geography, politics, nationality or cultural identity actually matters. Otherwise use neutral solid-colour balls.',
  'One dominant focal idea per image, readable within about one second on a phone screen. Do not fill space decoratively.',
  'Visible text is German only and must be spelled exactly as given. Bold high-contrast sans-serif or condensed treatment, white or black with a strong opposite outline, clearly separated from the main subject. If no text is requested, include no readable text at all and never invent pseudo-writing, English labels, logos or watermarks.',
  'STRICTLY FORBIDDEN: normal illustrated humans, humanoid cartoon people, stick figures, photorealism, realistic people, realistic hands or skin, realistic interiors, cinematic photo lighting, photo backgrounds, mixed photo-plus-cartoon media, anime, manga, clay, glossy 3D, Pixar-like rendering, stock-photo aesthetics, painterly concept art, detailed medical 3D anatomy, busy icon collages, floating UI boards, random tiny decorative countryballs, and 16:9 composition.',
  'Do not borrow the separate YouTube visual world. Reels stay 9:16 Serious Minimal Countryball Explainer.'
].join(' ');

export const FIXED_VISUAL_WORLD_PROMPT = [
  'Create a vertical 9:16 educational explainer image in exactly ONE fixed Reel visual world called Serious Minimal Countryball Explainer.',
  'PROJECT WORLD LOCK: lock this exact visual world before Image 01 and keep it for the complete Reel. Individual prompts may change the topic, props, symbols, background colour and composition, but must never change the core art direction.',
  'Use a clean serious minimal flat 2D countryball-style illustration language with thick clean black outlines, simple readable shapes, controlled flat colours, very light graphic shading and low-to-medium detail.',
  'Backgrounds should usually be solid or muted colour fields, subtle gradients or very light paper/grain texture. Use one simple contextual structure only when it materially helps the explanation. Never build detailed realistic rooms as the default.',
  'Background colours come ONLY from this fixed Reel palette and nothing else: deep navy #222C4C, warm cream #FAF3DC, slate blue-grey #8A9FA6, muted sage #8AB0A8, warm clay #A08878. Pick the one that fits the moment, keep it flat, and never invent a new background hue. Across one Reel the backgrounds may alternate between these five, but the series must never drift into lavender, salmon, olive, mint or any other hue outside the palette.',
  'If an actor is useful, use a large perfectly round countryball-like character with simple white eyes, restrained black-line facial expression and no separate human head, neck, hair or realistic face.',
  'Use country or region flag patterns only when geography, politics, nationality or cultural identity actually matters. For psychology, science, medicine, everyday life or general human behaviour use neutral solid-colour balls.',
  'A ball character is optional. Never add a tiny decorative ball in a corner or background merely as a brand sticker. Every character must have a clear narrative function.',
  'Do not make every frame just one ball on an empty background. When helpful, add one to three meaningful supporting elements such as a thermometer, book, door, paper roll, tombstone, spotlight, theatre mask, music note, speech bubble, brain symbol, simple map, screen, document, skull pile or one other topic-relevant prop.',
  'Every supporting element must strengthen the exact spoken idea. Do not fill space decoratively and do not clutter the composition.',
  'Use three composition modes across the Reel: minimal-symbolic, supported-explainer and simple-mini-scene. Rotate them naturally so adjacent images do not repeat the exact same centered ball-plus-label template.',
  'Minimal-symbolic means one large character or object plus zero or one meaningful symbol on a clean background.',
  'Supported-explainer means one large character or object plus one to three relevant symbols or props.',
  'Simple-mini-scene means one clear actor or object plus one simple contextual structure such as a door, table, book, tombstone, spotlight or screen. Keep the environment reduced and graphic, never realistic or busy.',
  'The overall tone must feel serious, clear, intelligent and recognizable, with restrained emotion. It may be lightly playful, but never childish, overly cute, goofy or chaotic.',
  'Use one dominant focal idea per image. The image should communicate the spoken idea within about one second on a phone screen.',
  'For medical, anatomical, technical or abstract concepts, translate the idea into simplified symbolic 2D elements in this same world. Never switch to realistic anatomy, photorealistic hands, detailed laboratories, generic human illustrations or 3D cutaways.',
  'Never generate normal illustrated humans, generic editorial human characters, humanoid cartoon people or stick figures. Human roles must be translated into the countryball-style character logic or represented symbolically when possible.',
  'Visible text must be German only. Image 01 must carry the strong German Reel headline. Later images may use zero to four German words only when the words materially improve understanding.',
  'Use bold high-contrast sans-serif or condensed headline treatment, usually white or black with a strong opposite outline. Keep text clear and separate from the main focal subject.',
  'If no text is requested, include no readable text. Never invent pseudo-writing, English labels, workflow text, logos or watermarks.',
  'STRICTLY FORBIDDEN: photorealism, realistic people, realistic hands or skin, realistic interiors, cinematic photo lighting, photo backgrounds, photo-plus-cartoon mixed media, anime, manga, clay, glossy 3D, Pixar-like rendering, stock-photo aesthetics, painterly concept art, detailed medical 3D anatomy, busy icon collages, floating UI boards, random tiny countryballs, random tongue or face gimmicks and topic-specific sub-visual-worlds.',
  'Do not borrow the separate YouTube visual world. Reels remain 9:16 Serious Minimal Countryball Explainer; YouTube keeps its own separate longform world.',
  'Final quality check: does this image clearly belong to the same serious minimal countryball series, use one dominant idea, remain clean without being pointlessly empty, and use only meaningful props? If not, correct this image without changing the global world.'
].join(' ');
