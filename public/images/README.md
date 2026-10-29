# Aset gambar BAJAVERSE

Letakkan gambar di sini, lalu referensikan dari data cerita. Selama file belum ada,
game tetap jalan: background memakai gradasi bawaan dan karakter memakai siluet.

## Background

Folder: `public/images/backgrounds/`

Isi field `background` pada storyboard (`src/data/storyboards/main.json`):

```json
{ "id": "SB_0001", "background": "/images/backgrounds/gerbang-kota.jpg" }
```

Rasio tampil 16:9. Saran ukuran 1280x720, format JPG atau WebP, di bawah 300 KB.

## Karakter

Folder: `public/images/characters/`

1. Daftarkan karakter di `src/data/characters/characters.json`:

```json
{
  "id": "penjaga_tua",
  "name": "Penjaga Tua",
  "title": "Penjaga Gerbang",
  "image": "/images/characters/penjaga-tua.png"
}
```

2. Tampilkan di adegan lewat field `characters` pada storyboard:

```json
{ "id": "SB_0002", "characters": ["penjaga_tua"] }
```

Gunakan PNG, SVG, atau WebP dengan latar transparan, berdiri penuh. SVG pixel-art cocok untuk sprite bergaya retro dan dapat ditampilkan tanpa latar kotak.
Nama file memakai huruf kecil dan tanda hubung, tanpa spasi.

Nama file di data harus sama persis dengan file di folder, termasuk huruf besar-kecil
(server Vercel membedakan huruf besar dan kecil).
