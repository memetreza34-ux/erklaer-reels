function normalizeText(value) {
  return String(value ?? '')
    .toLocaleLowerCase('de-DE')
    .replace(/[„“”"'’`´.,!?;:()[\]{}…—–-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
function smartJoin(words) {
  return words
    .map((word) => String(word.text ?? '').trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+([,.;:!?…])/g, '$1')
    .replace(/([([{„“])\s+/g, '$1')
    .trim();
}

const words = [
  { text: "vom" },
  { text: "Gehirn" },
  { text: "oft" },
  { text: "mit" },
  { text: "„klingt" },
  { text: "plausibel“" },
  { text: "verwechselt." }
];

const cueText = smartJoin(words);
const timedText = words.map(w => w.text).join(' ');

console.log("cueText:", cueText);
console.log("norm cueText:", normalizeText(cueText));
console.log("timedText:", timedText);
console.log("norm timedText:", normalizeText(timedText));
console.log("Equal?", normalizeText(cueText) === normalizeText(timedText));
