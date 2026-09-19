/**
 * Kamerabewegung: eine einzige Quelle für Planung, Prüfung und Render.
 *
 * Die Tabelle lag vorher dreimal im Repo (Renderer, Effects-Guard, Timeline) und
 * konnte auseinanderlaufen. Wichtiger noch: es prüfte niemand, ob die Zahlen
 * überhaupt zum Bewegungstyp passen. Dadurch konnte ein Plan zehn verschiedene
 * Bewegungsnamen tragen und trotzdem zehnmal denselben 3-Prozent-Push-in rendern —
 * `pan-left` mit panX 0, `slow-zoom-out` mit 1.0 -> 1.03.
 */

export const MOTION_ALIASES = Object.freeze({
  'gentle-pan': 'ken-burns',
  'gentle-push-in': 'subtle-push-in',
  'medium-push-in': 'slow-zoom-in',
  'close-up-push-in': 'subtle-push-in',
  'slow-push-in': 'slow-zoom-in',
  'push-in': 'subtle-push-in',
  'pull-out': 'subtle-pull-out'
});

export const MOTION_DEFAULTS = Object.freeze({
  none: { startScale: 1, endScale: 1, startPanXPercent: 0, startPanYPercent: 0, panXPercent: 0, panYPercent: 0 },
  'subtle-push-in': { startScale: 1, endScale: 1.04, startPanXPercent: 0, startPanYPercent: 0, panXPercent: 0, panYPercent: 0 },
  'subtle-pull-out': { startScale: 1.04, endScale: 1, startPanXPercent: 0, startPanYPercent: 0, panXPercent: 0, panYPercent: 0 },
  'slow-zoom-in': { startScale: 1, endScale: 1.05, startPanXPercent: 0, startPanYPercent: 0, panXPercent: 0, panYPercent: 0 },
  'slow-zoom-out': { startScale: 1.05, endScale: 1, startPanXPercent: 0, startPanYPercent: 0, panXPercent: 0, panYPercent: 0 },
  'pan-left': { startScale: 1.04, endScale: 1.04, startPanXPercent: 0, startPanYPercent: 0, panXPercent: -2, panYPercent: 0 },
  'pan-right': { startScale: 1.04, endScale: 1.04, startPanXPercent: 0, startPanYPercent: 0, panXPercent: 2, panYPercent: 0 },
  'pan-up': { startScale: 1.04, endScale: 1.04, startPanXPercent: 0, startPanYPercent: 0, panXPercent: 0, panYPercent: -2 },
  'pan-down': { startScale: 1.04, endScale: 1.04, startPanXPercent: 0, startPanYPercent: 0, panXPercent: 0, panYPercent: 2 },
  'ken-burns': { startScale: 1.02, endScale: 1.06, startPanXPercent: -1.5, startPanYPercent: 0, panXPercent: 1.5, panYPercent: 0 }
});

export const MINIMUM_VISIBLE_SCALE_DELTA = 0.015;
export const MINIMUM_VISIBLE_PAN_PERCENT = 0.5;

const numberOr = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export function canonicalMotionType(type) {
  const raw = String(type ?? '').trim();
  return MOTION_ALIASES[raw] ?? raw;
}

/**
 * Löst einen geplanten Bewegungseintrag zu den Zahlen auf, mit denen der Renderer
 * tatsächlich rechnet. Fehlende Felder kommen aus MOTION_DEFAULTS des Typs.
 */
export function resolveMotion(motion = {}) {
  const requestedType = String(motion.type ?? '').trim();
  const type = canonicalMotionType(requestedType);
  const defaults = MOTION_DEFAULTS[type] ?? MOTION_DEFAULTS['subtle-push-in'];

  const startScale = numberOr(motion.startScale, defaults.startScale);
  const endScale = numberOr(motion.endScale, defaults.endScale);
  const startPanXPercent = numberOr(motion.startPanXPercent, defaults.startPanXPercent);
  const startPanYPercent = numberOr(motion.startPanYPercent, defaults.startPanYPercent);
  const endPanXPercent = numberOr(motion.panXPercent, defaults.panXPercent);
  const endPanYPercent = numberOr(motion.panYPercent, defaults.panYPercent);

  const scaleDelta = endScale - startScale;
  const panXDelta = endPanXPercent - startPanXPercent;
  const panYDelta = endPanYPercent - startPanYPercent;
  const panDelta = Math.max(Math.abs(panXDelta), Math.abs(panYDelta));

  return {
    requestedType,
    type,
    aliased: requestedType !== type,
    known: Object.hasOwn(MOTION_DEFAULTS, type),
    startScale,
    endScale,
    startPanXPercent,
    startPanYPercent,
    endPanXPercent,
    endPanYPercent,
    scaleDelta,
    panXDelta,
    panYDelta,
    panDelta,
    visiblyMoving: type !== 'none'
      && (Math.abs(scaleDelta) >= MINIMUM_VISIBLE_SCALE_DELTA || panDelta >= MINIMUM_VISIBLE_PAN_PERCENT)
  };
}

/**
 * Prüft, ob die Zahlen das tun, was der Typname verspricht. Ein `pan-left`, das
 * nicht nach links fährt, und ein `slow-zoom-out`, das hineinzoomt, sind stille
 * Planungsfehler: Das Reel sieht dann überall gleich aus, obwohl der Plan
 * Abwechslung behauptet.
 */
export function motionDirectionMismatch(motion = {}) {
  const resolved = resolveMotion(motion);
  const { type, scaleDelta, panXDelta, panYDelta } = resolved;
  const zoomsIn = scaleDelta >= MINIMUM_VISIBLE_SCALE_DELTA;
  const zoomsOut = scaleDelta <= -MINIMUM_VISIBLE_SCALE_DELTA;

  switch (type) {
    case 'none':
      return null;
    case 'subtle-push-in':
    case 'slow-zoom-in':
      return zoomsIn ? null : 'erwartet eine sichtbare Vergrößerung (endScale > startScale)';
    case 'subtle-pull-out':
    case 'slow-zoom-out':
      return zoomsOut ? null : 'erwartet eine sichtbare Verkleinerung (endScale < startScale)';
    case 'pan-left':
      return panXDelta <= -MINIMUM_VISIBLE_PAN_PERCENT ? null : 'erwartet einen Schwenk nach links (negatives panXPercent)';
    case 'pan-right':
      return panXDelta >= MINIMUM_VISIBLE_PAN_PERCENT ? null : 'erwartet einen Schwenk nach rechts (positives panXPercent)';
    case 'pan-up':
      return panYDelta <= -MINIMUM_VISIBLE_PAN_PERCENT ? null : 'erwartet einen Schwenk nach oben (negatives panYPercent)';
    case 'pan-down':
      return panYDelta >= MINIMUM_VISIBLE_PAN_PERCENT ? null : 'erwartet einen Schwenk nach unten (positives panYPercent)';
    case 'ken-burns':
      return (zoomsIn || zoomsOut) && Math.abs(panXDelta) >= MINIMUM_VISIBLE_PAN_PERCENT
        ? null
        : 'erwartet Zoom UND Schwenk gleichzeitig';
    default:
      return null;
  }
}

/**
 * Eine vollständige Bewegung inklusive aller Zahlen für einen Typ.
 */
export function motionForType(type, reason = '') {
  const canonical = canonicalMotionType(type);
  const defaults = MOTION_DEFAULTS[canonical] ?? MOTION_DEFAULTS['subtle-push-in'];
  return {
    type: canonical,
    startScale: defaults.startScale,
    endScale: defaults.endScale,
    panXPercent: defaults.panXPercent,
    panYPercent: defaults.panYPercent,
    easing: 'ease-in-out',
    ...(reason ? { reason } : {})
  };
}

// Interne Bildphasen bekommen eine Gegenbewegung zur Szenenbewegung. Sonst
// wiederholt jeder Schnitt innerhalb einer Szene dieselbe Fahrt und das Bild
// "pumpt" über die gesamte Reel-Länge im selben Takt.
const PHASE_COUNTER_MOTION = Object.freeze({
  'subtle-push-in': 'subtle-pull-out',
  'slow-zoom-in': 'slow-zoom-out',
  'subtle-pull-out': 'subtle-push-in',
  'slow-zoom-out': 'slow-zoom-in',
  'pan-left': 'pan-right',
  'pan-right': 'pan-left',
  'pan-up': 'pan-down',
  'pan-down': 'pan-up',
  'ken-burns': 'subtle-pull-out',
  none: 'subtle-push-in'
});

/**
 * Bewegung für eine interne Bildphase (phaseOrder >= 2). Alterniert gegen die
 * Szenenbewegung, damit benachbarte Bildmomente sichtbar unterschiedlich laufen.
 */
export function phaseCameraMotion(sceneMotion, phaseIndex) {
  const base = canonicalMotionType(sceneMotion?.type) || 'subtle-push-in';
  const counter = PHASE_COUNTER_MOTION[base] ?? 'subtle-pull-out';
  const type = phaseIndex % 2 === 1 ? counter : base;
  return motionForType(type, 'Gegenbewegung zur vorherigen Bildphase, damit benachbarte Schnitte nicht identisch laufen.');
}
