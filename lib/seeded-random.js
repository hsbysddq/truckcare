// Generator acak BERBENIH (seeded) untuk semua data turunan Circle T:
// telemetri, kecepatan, level solar, jadwal, dan pengaduan contoh. Dengan
// benih yang sama urutan angkanya selalu sama, jadi menjalankan generator
// dua kali menghasilkan data yang persis sama. Jangan pakai Math.random()
// di generator data mana pun; pakai fungsi di sini.
//
// Bebas dependensi dan aman untuk SSR maupun script Node (ESM).
// Salinan yang sama dipakai simulator VPS: simulasi/src/seeded-random.js.

// Benih dari string (mis. plat nomor) -> bilangan bulat 32-bit (FNV-1a).
export function hashSeed(text) {
  let h = 0x811c9dc5;
  for (const ch of String(text ?? "")) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// Mengembalikan fungsi rand() -> [0, 1) yang deterministik (mulberry32).
// seed boleh angka atau string.
export function seededRandom(seed = 1) {
  let a = (typeof seed === "number" ? seed : hashSeed(seed)) >>> 0;
  return function rand() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Satu nilai [0, 1) untuk sebuah benih (pengganti fungsi hash sin() lama):
// dipakai saat kode butuh angka stabil per (hari, truk) tanpa menyimpan
// state generator.
export function seededValue(seed) {
  return seededRandom(typeof seed === "number" ? Math.floor(seed * 1000003) : seed)();
}

export const randBetween = (rand, min, max) => min + rand() * (max - min);
export const randInt = (rand, min, max) => Math.floor(randBetween(rand, min, max + 1));
export const randPick = (rand, list) => list[Math.floor(rand() * list.length)];
