# Menulis cerita BAJAVERSE

Semua adegan ada di file JSON di folder ini. Cerita tidak ditulis di halaman web;
engine membaca data ini. Urutan file dimuat diatur di `src/engine/StoryboardEngine.js`
(`prologue.json`, `berkah.json`, `perjanjian.json`, lalu `main.json`).

## Alur saat ini

Prolog mengikuti napas Tsukimichi musim 1 episode 1-2 (dipanggil sebagai pahlawan, ditolak
dewi, dibuang ke tanah gersang, kekuatan tersembunyi bangkit, ikatan dengan naga, ancaman besar).
Karakter, nama, dan teksnya asli untuk BAJAVERSE.

```
PR_0001 Kegelapan -> PR_0002 Terlahir Kembali -> PR_0003 (isi nama)
 -> PR_0004 -> PR_0005 -> PR_0006 (pilih role) -> PR_0007
 -> PR_0008 Penimbangan -> PR_0009 Timbangan Kosong (Dewi menolak)
      PR_0010 menolak | PR_0011 diam (dua cabang pendek, bertemu lagi)
 -> PR_0012 Lemah Wangkal (tanah gersang)
 -> SK_0001 Jendela Berkah (kekuatan role terbuka)
 -> SK_0002 Pelataran Batu (3 percobaan, urutan bebas: SK_0003 | SK_0004 | SK_0005)
 -> SK_0006 Jerit di Balik Kabut
 -> perjanjian.json: PJ_0001 selamatkan Laras -> PJ_0002 -> PJ_0003 ilusi kabut
      -> PJ_0004 Naga Aruna (dua pilihan, set flag aruna_pact / aruna_vow)
      -> PJ_0005 ikatan -> PJ_0006 Pelahap Nama -> PJ_0007 gerbang
 -> SB_0001 (cerita gerbang)
```

Flag yang sudah diisi tetapi belum dipakai cerita lanjutan: `aruna_pact` (selalu true setelah
PJ_0004) dan `aruna_vow` (true jika pemain meminta Aruna berhenti menuntut persembahan).

## Satu adegan

```json
{
    "id": "SB_0010",
    "title": "Judul adegan",
    "description": "Paragraf pertama.\n\nParagraf kedua (pisahkan dengan baris kosong).",
    "background": "/images/backgrounds/nama-file.jpg",
    "mood": "void",
    "choices": [
        { "text": "Teks pilihan", "target": "SB_0011" }
    ]
}
```

| Field | Fungsi |
| --- | --- |
| `id` | Unik. Awalan `PR_` otomatis tampil sinematik (teks muncul baris demi baris). |
| `type` | `story` (bawaan, pilih salah satu `choices`), `input_name` (pemain mengetik nama), `choose_role` (pemain memilih role). |
| `next` | Wajib untuk `input_name` dan `choose_role`: id adegan berikutnya. |
| `description` | Teks adegan. Baris kosong (`\n\n`) memisahkan paragraf. Kalimat pendek (maks. 56 huruf) pada adegan sinematik tampil besar di tengah. Paragraf yang diawali tanda kutip tampil sebagai ucapan. |
| `background` | Gambar adegan di atas teks. Jika sama dengan gambar latar halaman (`bajaverse-hero.jpg`), tidak ditampilkan dua kali. |
| `mood` | `void` = layar gelap dengan cahaya biru berdenyut. Kosong = dunia dengan gambar latar. |
| `cinematic` | Opsional. `true` atau `false` untuk memaksa efek muncul perlahan. |
| `showStatus` | Opsional. `true` menampilkan "Jendela Status" (nama, role, level, skill pemain) di bawah teks. |
| `characters` | Opsional. Daftar id dari `src/data/characters/characters.json`. |
| `prompt`, `placeholder`, `button` | Opsional. Teks formulir pada adegan `input_name` dan `choose_role`. |

## Kata pengganti

Dapat dipakai di `title`, `description`, dan `text` pilihan:

- `{name}` nama pemain
- `{role}` nama role yang dipilih
- `{roleIntro}` paragraf pembuka khusus role (isi di `src/data/roles/roles.json`, field `intro`)
- `{skill}` nama berkah awal pemain, `{skillDesc}` deskripsinya
- `{skillStatue}`, `{skillCrystal}`, `{skillWater}`, `{skillRescue}` teks berkah pada patung, kristal, genangan, dan saat menyelamatkan Laras (lihat bagian Skill)

## Pilihan bersyarat dan flag

Sebuah pilihan dapat mengatur flag dan dapat disembunyikan berdasarkan flag:

```json
{
    "text": "Kembali ke pelataran",
    "setFlags": { "trial_statue": true },
    "target": "SK_0002"
},
{
    "text": "Uji berkahmu pada patung",
    "unlessFlags": ["trial_statue"],
    "target": "SK_0003"
},
{
    "text": "Aku sudah memahami berkahku",
    "ifFlags": ["trial_statue", "trial_crystal", "trial_water"],
    "target": "SK_0006"
}
```

- `setFlags` diatur saat pilihan dipilih.
- `ifFlags` pilihan tampil hanya jika semua flag itu sudah diatur.
- `unlessFlags` pilihan disembunyikan jika salah satu flag itu sudah diatur.

Awas: pastikan selalu ada pilihan yang tampil di setiap adegan. Adegan yang semua pilihannya
tersembunyi akan menjadi jalan buntu.

## Skill dan berkah awal

Setiap role punya satu berkah awal. Datanya ada di dua tempat:

- `src/data/roles/roles.json`: field `startingSkill` berisi id skill. Skill ini otomatis
  diberikan saat pemain memilih role.
- `src/data/skills/skills.json`: `id`, `name`, `type`, `description`, dan `trials`
  (`statue`, `crystal`, `water`, `rescue`) yaitu satu atau dua kalimat tentang apa yang terjadi saat
  skill dipakai pada tiga benda di Pelataran Batu dan saat melawan serigala berkepala dua.

Saat server menyala, `SkillEngine` memeriksa data ini dan mencetak peringatan jika ada
role tanpa skill, skill yang tidak dikenal, atau teks percobaan yang hilang.

## Memeriksa cerita

Saat server menyala, `StoryboardEngine` memeriksa semua adegan dan mencetak peringatan
di terminal jika ada pilihan yang menuju adegan yang tidak ada, atau `next` yang hilang.
