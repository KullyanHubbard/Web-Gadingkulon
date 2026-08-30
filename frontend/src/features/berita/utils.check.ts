/**
 * Self-check logika murni berita. Jalankan dari `frontend/`:
 *
 *   node --experimental-strip-types src/features/berita/utils.check.ts
 *
 * Tanpa test runner — proyek ini tidak punya satu pun (CLAUDE.md §9), dan
 * memasangnya cuma untuk berkas ini bukan pertukaran yang sepadan.
 */
import assert from 'node:assert/strict';
import {
  formatTanggal,
  keParagraf,
  keSlug,
  slugUnik,
  urutTerbaru,
} from './utils.ts';
import type { Berita } from './types.ts';

function berita(id: string, slug: string, tanggalTerbit: string): Berita {
  return {
    id,
    slug,
    tanggalTerbit,
    judul: slug,
    foto: '',
    penulis: 'Uji',
    isi: '',
  };
}

// keSlug: huruf kecil, tanda baca jadi satu tanda hubung, tidak ada sisa di ujung.
assert.equal(keSlug('Kerja Bakti RW 01!'), 'kerja-bakti-rw-01');
assert.equal(keSlug('  --Halo, Dunia--  '), 'halo-dunia');
assert.equal(keSlug('!!!'), '');

// slugUnik: bentrok diberi akhiran, dan akhirannya naik sampai benar-benar bebas.
const adaSlug = [
  berita('1', 'kerja-bakti', '2026-08-01'),
  berita('2', 'kerja-bakti-2', '2026-08-02'),
];
assert.equal(slugUnik('Kerja Bakti', adaSlug), 'kerja-bakti-3');
assert.equal(slugUnik('Rapat RT', adaSlug), 'rapat-rt');
// Judul yang seluruhnya tanda baca tetap menghasilkan slug yang bisa dipakai.
assert.equal(slugUnik('???', []), 'berita');
// Menyunting berita sendiri tidak dianggap bentrok dengan dirinya.
assert.equal(slugUnik('Kerja Bakti', adaSlug, '1'), 'kerja-bakti');

// urutTerbaru: terbaru dulu, dan tidak mengubah array masukan.
const acak = [
  berita('a', 'a', '2026-08-01'),
  berita('c', 'c', '2026-08-20'),
  berita('b', 'b', '2026-08-10'),
];
assert.deepEqual(
  urutTerbaru(acak).map((b) => b.id),
  ['c', 'b', 'a'],
);
assert.deepEqual(
  acak.map((b) => b.id),
  ['a', 'c', 'b'],
);

// keParagraf: dipisah baris kosong, spasi dibuang, paragraf kosong tidak lolos.
assert.deepEqual(keParagraf('Satu.\n\nDua.'), ['Satu.', 'Dua.']);
assert.deepEqual(keParagraf('Satu.\n\n   \n\nDua.  '), ['Satu.', 'Dua.']);
assert.deepEqual(keParagraf('   '), []);
// Satu baris ganti biasa TIDAK memecah paragraf.
assert.deepEqual(keParagraf('Satu.\nMasih satu.'), ['Satu.\nMasih satu.']);

// formatTanggal: ISO sah diterjemahkan, yang tidak sah dikembalikan apa adanya.
assert.equal(formatTanggal('2026-08-31'), '31 Agustus 2026');
assert.equal(formatTanggal('bukan-tanggal'), 'bukan-tanggal');

console.log('berita/utils: OK');
