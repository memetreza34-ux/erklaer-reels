/**
 * Gemeinsames Argument-Lesen für alle CLI-Einstiegspunkte.
 *
 * Diese vier Zeilen lagen vorher in 21 Dateien identisch kopiert. Die Semantik
 * bleibt absichtlich exakt dieselbe wie zuvor - das ist eine Entdopplung, keine
 * Verhaltensänderung. util.parseArgs wäre strenger und würde bestehende Aufrufe
 * mit unbekannten Flags abweisen.
 */

/**
 * Liest den Wert, der direkt hinter einem Flag steht.
 *
 * @param {string} name Flag, z. B. '--dir'.
 * @param {string[]} [argv] Argumentliste, Standard ist process.argv.
 * @returns {string|undefined}
 */
export function getArgument(name, argv = process.argv) {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
}

/**
 * Prüft, ob ein Flag gesetzt ist.
 *
 * @param {string} name
 * @param {string[]} [argv]
 * @returns {boolean}
 */
export function hasFlag(name, argv = process.argv) {
  return argv.includes(name);
}
