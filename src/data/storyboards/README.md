# Menulis cerita BAJAVERSE

Semua adegan ada di file JSON di folder ini. Cerita tidak ditulis di halaman web;
engine membaca data ini. Urutan file dimuat diatur di `src/engine/StoryboardEngine.js`
(`prologue.json`, `berkah.json`, `perjanjian.json`, `bukit-abu.json`, `wilwatikta.json`, `pawitra.json`, lalu `main.json`).

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
      -> PJ_0005 ikatan -> PJ_0006 Pelahap Nama -> PJ_0007 Pagi di Bukit Abu
 -> bukit-abu.json (bagian 2): BA_0001 desa (hub, urutan bebas)
      BA_0002 Gandar | BA_0003 Wulan | BA_0004 Darpa  (masing-masing kembali ke BA_0001; mereka tetap di desa, hanya flag met_* yang diisi)
 -> BA_0005 Perapian Malam (belajar skill kedua) -> BA_0006 Sampai Bertemu Lagi -> BA_0007 gerbang (pemain masih sendirian)
 -> SB_0001 (cerita gerbang; level 1 -> 2 saat pemain "Masuk ke kota" di SB_0002) -> SB_0006 "Masuk ke alun-alun"
 -> wilwatikta.json (WK_0001-0015, solo): alun-alun hub (3 petunjuk: pasar | dermaga | warung, plus candi mandala opsional)
      -> balai Dharmayatra, daftar sebagai petualang tunggal, ambil tugas Pawitra (flag quest_pawitra)
 -> pawitra.json (PW_0001-0055): 5 tahap, tiap tahap hub dengan flag *_done; pilihan keluar hanya muncul setelah semua tempat selesai
      tahap 1 Kaki Barat (Jolotundo, Candi Bayi) -> level 3 | tahap 2 Lereng Barat (Putri, Pura, Gentong) -> level 4
      tahap 3 Barat Laut (Lurah, Kendalisodo) -> level 5 | tahap 4 Gajahmungkur (Kerajaan, Gajah, Wayang) -> level 6
      tahap 5 Puncak: tiga cara menyebut nama -> PW_0053 "Paku yang Tertanam" -> level 7 -> PW_0055 laporan (akhir bagian ini, belum ada pilihan lanjut)
      satu adegan wawasan per role (ifRole), tampil opsional di tahap 1-4; satu role hanya melihat wawasannya sendiri
```

Flag yang sudah diisi tetapi belum dipakai cerita lanjutan: `aruna_pact` (selalu true setelah
PJ_0004) dan `aruna_vow` (true jika pemain meminta Aruna berhenti menuntut persembahan).

## Dialog dengan potret

Awali sebuah paragraf dengan `@id:` agar dibaca sebagai ucapan karakter, mis. `@ratih: "Pendaftaran?"`.
`@player:` adalah pemain, ditampilkan dengan potret rolenya (`public/images/roles/<roleId>.png`).
Id lain harus ada di `characters.json`; potretnya dari `image` (`public/images/characters/<id>.png`).
Jika berkas gambar belum ada, UI memakai ikon role (pemain) atau huruf awal nama (NPC).
Paragraf tanpa `@` tetap narasi.

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
- `{skill2}`, `{skill2Desc}`, `{skill2Learn}` skill kedua role, `{teacher}` nama temannya yang mengajar
- `{bondGandar}`, `{bondWulan}`, `{bondDarpa}` paragraf relasi sesuai role (isi di `roles.json`, field `bonds`)
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
- `ifRole` (daftar id role, mis. `["medic"]`) pilihan tampil hanya untuk pemain dengan role itu.
- `unlessFlags` pilihan disembunyikan jika salah satu flag itu sudah diatur.

Pilihan juga dapat memberi hadiah:

- `"addSkill": "@second"` memberi skill kedua role pemain (atau isi dengan id skill tertentu).
- `"addParty": "gandar"` memasukkan karakter (id dari `characters.json`) ke party. Party tampil di Jendela Status. Belum dipakai cerita mana pun: sampai gerbang pemain masih solo, party dibentuk bertahap di bab berikutnya.

- `"setLevel": 2` menaikkan pemain ke level itu (tidak pernah menurunkan, maksimal 10). Pada langkah yang menaikkan level, UI menampilkan penanda "Naik level".
- Party maksimal 10 orang. Karakter di `characters.json` boleh punya `roles` berisi satu atau dua id role (anggota ber-role ganda); tampil di Jendela Status.

Awas: pastikan selalu ada pilihan yang tampil di setiap adegan. Adegan yang semua pilihannya
tersembunyi akan menjadi jalan buntu.

## Skill dan berkah awal

Setiap role punya satu berkah awal. Datanya ada di dua tempat:

- `src/data/roles/roles.json`: field `startingSkill` berisi id skill. Skill ini otomatis
  diberikan saat pemain memilih role.
- `src/data/skills/skills.json`: `id`, `name`, `type`, `description`, dan `trials`
  (`statue`, `crystal`, `water`, `rescue`) yaitu satu atau dua kalimat tentang apa yang terjadi saat
  skill dipakai pada tiga benda di Pelataran Batu dan saat melawan serigala berkepala dua.

Skill kedua: `roles.json` punya `secondSkill` (id skill) dan `bonds` (tiga paragraf: gandar, wulan, darpa).
Di `skills.json`, skill kedua butuh `teacher` (id karakter) dan `learn` (adegan belajarnya).

Saat server menyala, `SkillEngine` memeriksa data ini dan mencetak peringatan jika ada
role tanpa skill, skill yang tidak dikenal, atau teks percobaan yang hilang.

## Memeriksa cerita

Saat server menyala, `StoryboardEngine` memeriksa semua adegan dan mencetak peringatan
di terminal jika ada pilihan yang menuju adegan yang tidak ada, atau `next` yang hilang.

## Sejarah dan mitologi yang tersirat

Cerita sengaja tidak menjelaskan sejarah secara langsung. Petunjuknya diselipkan lewat detail
tempat dan ucapan tokoh, supaya pemain yang mengenalnya merasa "oh, itu ...".

| Tempat di game | Rujukan (tidak disebut namanya) |
| --- | --- |
| Bukit Abu | Gunung Pawitra (Penanggungan): "suci"; kisah puncak Mahameru yang terlepas (Tantu Panggelaran); teras batu berundak; delapan bukit sekeliling; ratusan situs pertapaan |
| Wilwatikta | Majapahit |
| Kabut Lupa | Kerajaan dan nama yang hilang dari ingatan, seperti banyak naskah yang tak sampai kepada kita |

Rujukan harus dicek ke sumber sebelum ditambah (lihat daftar sumber di pesan commit atau tanyakan ke penulis).
