// Salinan lib/seeded-random.js untuk simulator (paket terpisah di VPS).
// Generator acak berbenih (mulberry32): dengan benih sama, urutan angka sama.
// Jangan pakai Math.random() untuk data telemetri.

export function hashSeed(text) {
  let h = 0x811c9dc5;
  for (const ch of String(text ?? '')) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function seededRandom(seed = 1) {
  let a = (typeof seed === 'number' ? seed : hashSeed(seed)) >>> 0;
  return function rand() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
