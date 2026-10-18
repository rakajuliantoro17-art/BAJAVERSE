# Menulis cerita BAJAVERSE

Semua adegan ada di file JSON di folder ini. Cerita tidak ditulis di halaman web;
engine membaca data ini. Urutan file dimuat diatur di `src/engine/StoryboardEngine.js`
(`prologue.json` dulu, lalu `main.json`).

## Alur saat ini

```
PR_0001 Kegelapan -> PR_0002 Terlahir Kembali -> PR_0003 (isi nama)
 -> PR_0004 -> PR_0005 -> PR_0006 (pilih role) -> PR_0007 -> SB_0001 (cerita gerbang)
```

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
| `characters` | Opsional. Daftar id dari `src/data/characters/characters.json`. |
| `prompt`, `placeholder`, `button` | Opsional. Teks formulir pada adegan `input_name` dan `choose_role`. |

## Kata pengganti

Dapat dipakai di `title`, `description`, dan `text` pilihan:

- `{name}` nama pemain
- `{role}` nama role yang dipilih
- `{roleIntro}` paragraf pembuka khusus role (isi di `src/data/roles/roles.json`, field `intro`)

## Memeriksa cerita

Saat server menyala, `StoryboardEngine` memeriksa semua adegan dan mencetak peringatan
di terminal jika ada pilihan yang menuju adegan yang tidak ada, atau `next` yang hilang.
