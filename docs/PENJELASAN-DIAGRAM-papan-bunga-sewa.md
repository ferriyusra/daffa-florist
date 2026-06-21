# Penjelasan Diagram UML — Sistem Sewa Papan Bunga (Daffa Florist)

**Sumber rujukan:** [PRD-papan-bunga-sewa.md](PRD-papan-bunga-sewa.md) · [ERD-papan-bunga-sewa.md](ERD-papan-bunga-sewa.md) · `prisma/schema.prisma`
**Berkas diagram:** [USE-CASE-papan-bunga-sewa.drawio](USE-CASE-papan-bunga-sewa.drawio) · [UML-papan-bunga-sewa.drawio](UML-papan-bunga-sewa.drawio) (3 halaman: Class, Sequence, Activity)
**Tanggal:** 21 Juni 2026
**Status:** Draft

> Dokumen ini menjelaskan setiap diagram perancangan sistem secara naratif agar dapat langsung dikutip pada bab Perancangan/Analisis Sistem. Diagram dibuat dengan **draw.io (diagrams.net)** dan mengikuti notasi **UML (Unified Modeling Language)**.

---

## Daftar Isi

1. [Use Case Diagram](#1-use-case-diagram)
2. [Class Diagram](#2-class-diagram)
3. [Sequence Diagram](#3-sequence-diagram)
4. [Activity Diagram](#4-activity-diagram)
5. [Keterkaitan Antar Diagram](#5-keterkaitan-antar-diagram)

---

## 1. Use Case Diagram

### 1.1 Pengertian
Use Case Diagram menggambarkan **fungsionalitas sistem dari sudut pandang pengguna** — yaitu *apa* yang dapat dilakukan tiap aktor terhadap sistem, bukan *bagaimana* sistem mengerjakannya. Diagram ini menjadi dasar penentuan kebutuhan fungsional.

### 1.2 Komponen Notasi
| Notasi | Lambang | Keterangan |
|--------|---------|-----------|
| **Aktor** | Gambar orang (stick figure) | Peran pengguna/sistem eksternal yang berinteraksi |
| **Use Case** | Elips | Satu fungsi/layanan yang disediakan sistem |
| **Batas Sistem** | Kotak besar | Memisahkan bagian dalam sistem dari aktor di luar |
| **Asosiasi** | Garis lurus | Hubungan aktor dengan use case yang dipakainya |
| **`<<include>>`** | Garis putus berpanah | Use case dasar **selalu** memanggil use case lain (wajib) |
| **`<<extend>>`** | Garis putus berpanah | Use case tambahan yang berjalan **secara kondisional** |
| **Generalisasi** | Panah segitiga kosong | Pewarisan peran (aktor turunan mewarisi aktor induk) |

### 1.3 Aktor Sistem
| Aktor | Peran | Hak Akses |
|-------|-------|-----------|
| **User (Pelanggan)** | Memesan & menyewa papan bunga, membayar, melacak pesanan | Publik + login |
| **Admin** | Mengelola katalog, unit, pesanan, pembayaran, dan jadwal | Admin |
| **Tim Lapangan** | *Spesialisasi Admin* — eksekusi pasang/ambil di lokasi | Admin (subset operasional) |

> **Tim Lapangan** digambarkan sebagai **generalisasi** dari **Admin** (`is-a`): ia memakai akun admin tetapi perannya dibatasi pada use case operasional lapangan.

### 1.4 Daftar Use Case per Peran

**User (Pelanggan):** Registrasi/Login, Kelola Alamat, Telusuri Katalog & Detail Produk, Pilih Periode Sewa, Lihat Ketersediaan Unit, Kelola Keranjang, Checkout & Buat Pesanan, Bayar + Unggah Bukti, Lacak Status Pesanan, Batalkan Pesanan.

**Admin:** Kelola Katalog Produk, Kelola Inventaris Unit, Lihat Kalender Pesanan, Verifikasi Pembayaran, Ubah Status Pesanan, Atur Jadwal Pasang/Bongkar, Atur Ongkir per Zona, Selesaikan Pesanan.

**Tim Lapangan:** Lihat Tugas Pasang/Ambil Harian, Tandai Terpasang (INSTALLED), Catat Kondisi Unit saat Kembali.

### 1.5 Relasi `include` / `extend`
- **`<<include>>` (wajib):** *Checkout & Buat Pesanan* selalu meng-*include* **Login**, **Lihat Ketersediaan**, dan **Bayar**; *Verifikasi Pembayaran* selalu meng-*include* **Ubah Status**; *Selesaikan Pesanan* meng-*include* **Catat Kondisi Unit**.
- **`<<extend>>` (kondisional):** *Atur Jadwal Pasang* & *Tandai Terpasang* memperluas **Ubah Status** (transisi `SCHEDULED`/`INSTALLED`); *Atur Ongkir per Zona* memperluas **Checkout** (rilis awal diisi manual).

---

## 2. Class Diagram

### 2.1 Pengertian
Class Diagram menggambarkan **struktur statis** sistem: kelas (entitas data), atribut yang dimiliki, serta relasi dan kardinalitas antar kelas. Diagram ini diturunkan dari ERD dan `prisma/schema.prisma`, sehingga menjadi cetak biru basis data sistem.

### 2.2 Komponen Notasi
| Notasi | Lambang | Keterangan |
|--------|---------|-----------|
| **Kelas** | Kotak 3 bagian | Nama kelas, daftar atribut, (operasi bila ada) |
| **Atribut** | `± nama : tipe` | `+` publik, `-` privat |
| **`«PK»` / `«FK»` / `«UK»`** | Stereotype | Primary Key / Foreign Key / Unique Key |
| **`[0..1]`** | Penanda | Atribut bersifat opsional (nullable) |
| **Komposisi** | Garis + belah ketupat **terisi** | Bagian tak bisa hidup tanpa induk (`onDelete: Cascade`) |
| **Asosiasi** | Garis lurus/putus | Hubungan longgar/opsional antar kelas |
| **Enumerasi** | Kotak `«enumeration»` | Tipe dengan nilai terbatas |

### 2.3 Kelompok Kelas
- **Pengguna & alamat:** `User` (memuat `role`: CUSTOMER/ADMIN untuk kontrol akses) dan `Address` (alamat + `landmark` lokasi acara).
- **Katalog produk:** `Product` sebagai induk, dengan enam kelas anak: `ProductSize`, `ProductTemplate`, `ProductThemeColor`, `ProductAddon`, `ProductUnit` (unit fisik untuk hitung ketersediaan), dan `RentalDurationOption` (opsi durasi & harga sewa).
- **Transaksi:** `Order` (kepala pesanan), `OrderItem` (detail per papan, memuat field sewa inti `installDate`, `rentalDays`, `pickupDate`), `Payment` (DP/pelunasan/refund), dan `OrderStatusHistory` (audit trail status).
- **Enumerasi:** `UserRole`, `OrderStatus`, `PaymentType`, `PaymentStatus`.

### 2.4 Konsep Multiplisitas (Kardinalitas)
Multiplisitas menyatakan **berapa banyak objek** suatu kelas yang dapat berhubungan dengan **satu** objek kelas lawannya, ditulis di kedua ujung garis dan dibaca menyilang.

| Notasi | Arti |
|--------|------|
| `1` | tepat satu (wajib) |
| `0..1` | nol atau satu (opsional) |
| `1..*` | satu atau lebih (wajib minimal satu) |
| `0..*` (`*`) | nol atau lebih (boleh kosong, tak terbatas) |

### 2.5 Tabel Multiplisitas Seluruh Relasi

| No | Relasi (Kelas A — Kelas B) | A : B | Cara baca | Dasar / aturan bisnis |
|----|---------------------------|:-----:|-----------|----------------------|
| 1 | User — Address | `1` : `0..*` | Satu user punya 0–banyak alamat; satu alamat milik satu user | Pelanggan dapat menyimpan banyak alamat |
| 2 | User — Order | `1` : `0..*` | Satu user membuat 0–banyak pesanan; satu pesanan milik satu user | Riwayat pesanan |
| 3 | Address — Order | `0..1` : `0..*` | Satu pesanan memakai 0/1 alamat; satu alamat dipakai 0–banyak pesanan | `addressId` nullable |
| 4 | Order — OrderItem | `1` : `1..*` | Satu pesanan berisi **minimal satu** item; satu item milik satu pesanan | Pesanan tidak boleh kosong (komposisi) |
| 5 | Order — Payment | `1` : `0..*` | Satu pesanan punya 0–banyak transaksi bayar | DP → pelunasan → refund (komposisi) |
| 6 | Order — OrderStatusHistory | `1` : `0..*` | Satu pesanan punya 0–banyak catatan status | Audit trail (komposisi) |
| 7 | Product — ProductSize | `1` : `0..*` | Satu produk punya 0–banyak ukuran | Varian ukuran (komposisi) |
| 8 | Product — ProductTemplate | `1` : `0..*` | Satu produk punya 0–banyak template | (komposisi) |
| 9 | Product — ProductThemeColor | `1` : `0..*` | Satu produk punya 0–banyak warna tema | (komposisi) |
| 10 | Product — ProductAddon | `1` : `0..*` | Satu produk punya 0–banyak add-on | mis. standing flower (komposisi) |
| 11 | Product — ProductUnit | `1` : `0..*` | Satu produk punya 0–banyak unit fisik | Inventaris ketersediaan (komposisi) |
| 12 | Product — RentalDurationOption | `1` : `0..*` | Satu produk punya 0–banyak opsi durasi | Opsi 1/3/7 hari (komposisi) |
| 13 | Product — OrderItem | `0..1` : `0..*` | Satu item merujuk 0/1 produk; satu produk dipesan di 0–banyak item | `productId` nullable (`SetNull`) jaga snapshot histori |
| 14 | ProductUnit — OrderItem | `0..1` : `0..*` | Satu item dialokasikan 0/1 unit; satu unit dipakai di 0–banyak item (periode beda) | `unitId` nullable |
| 15 | User — Payment (`verifiedBy`) | `0..1` : `0..*` | Satu pembayaran diverifikasi 0/1 admin; satu admin memverifikasi 0–banyak | `verifiedBy` nullable |
| 16 | User — OrderStatusHistory (`changedBy`) | `0..1` : `0..*` | Satu catatan diubah 0/1 user; satu user mengubah 0–banyak catatan | `changedBy` nullable |

### 2.6 Catatan Desain
`OrderItem` sengaja **men-denormalisasi** data produk (`productSlug`, `productTitle`, `productImage`). Ini agar **pesanan lama tetap akurat** meskipun produk diubah atau dihapus (snapshot historis) — alasan teknis yang menjelaskan relasi `Product — OrderItem` memakai `onDelete: SetNull` (multiplisitas `0..1`).

---

## 3. Sequence Diagram

### 3.1 Pengertian
Sequence Diagram menggambarkan **interaksi antar objek terhadap urutan waktu** untuk satu skenario tertentu. Di sini skenarionya adalah **proses pemesanan sewa** (`rental.checkAvailability` lalu `order.createRental`).

### 3.2 Komponen Notasi
| Notasi | Keterangan |
|--------|-----------|
| **Lifeline** | Objek/partisipan; garis putus vertikal = rentang waktu hidupnya |
| **Pesan sinkron** | Panah penuh berkepala padat (pemanggilan fungsi) |
| **Pesan balik (return)** | Panah putus-putus (nilai yang dikembalikan) |
| **Fragment `alt`** | Kotak percabangan kondisional (if/else) |

### 3.3 Partisipan (Lifeline)
`:Pelanggan` → `:Halaman Web (UI)` → `:tRPC API (Server)` → `:Prisma / PostgreSQL`.

### 3.4 Alur Interaksi
1. Pelanggan memilih produk, opsi, lalu **tanggal pasang + durasi** pada UI.
2. UI memanggil `rental.checkAvailability(productId, sizeLabel, installDate, rentalDays)` ke server.
3. Server menjalankan query: mencari `OrderItem` yang **periodenya tumpang-tindih** dan menghitung jumlah `ProductUnit`.
4. Database mengembalikan jumlah unit terpakai (*return message*).
5. Server membalas `{ available, pickupDate, remainingUnits, nextAvailableDate? }` ke UI.

Selanjutnya masuk **fragment `alt`** dengan dua cabang:
- **`[tersedia]`** — UI menampilkan harga → Pelanggan checkout → `order.createRental()` → server membuka **transaksi** dan **memvalidasi ulang ketersediaan** (`SELECT ... FOR UPDATE`) → `INSERT Order (PENDING)` + `OrderItem (pickupDate)` + `OrderStatusHistory` → `COMMIT` → kembalikan `orderNumber` → tampil halaman konfirmasi.
- **`[penuh]`** — sistem menampilkan tanggal alternatif terdekat (`nextAvailableDate`).

### 3.5 Poin Penting
Pengecekan ketersediaan dilakukan **dua kali**: saat pratinjau dan **divalidasi ulang secara transaksional** ketika menyimpan. Mekanisme ini mencegah **double-booking** (*race condition*) saat dua pelanggan memesan unit terakhir bersamaan — aturan kritis pada PRD §8.

---

## 4. Activity Diagram

### 4.1 Pengertian
Activity Diagram menggambarkan **alur kerja/proses bisnis** secara menyeluruh dari awal sampai akhir, termasuk percabangan keputusan dan pembagian tanggung jawab antar peran.

### 4.2 Komponen Notasi
| Notasi | Lambang | Keterangan |
|--------|---------|-----------|
| **Initial node** | Lingkaran hitam | Titik mulai |
| **Activity** | Kotak sudut tumpul | Satu aktivitas/aksi |
| **Decision** | Belah ketupat | Percabangan kondisi (ya/tidak) |
| **Flow** | Panah | Urutan aliran aktivitas |
| **Final node** | Lingkaran bercincin | Titik selesai |
| **Swimlane** | Kolom berjudul | Pemisah tanggung jawab tiap peran |

### 4.3 Pembagian Swimlane
Tiga jalur: **Pelanggan**, **Sistem**, dan **Admin / Tim Lapangan** — sehingga jelas aktivitas mana dikerjakan oleh siapa.

### 4.4 Alur Proses
- **Pelanggan:** pilih produk & opsi → pilih tanggal pasang + durasi.
- **Sistem:** cek ketersediaan → keputusan **"Tersedia?"**
  - *Tidak* → tampilkan tanggal alternatif → kembali (loop) ke pemilihan tanggal.
  - *Ya* → tampilkan harga & estimasi pickup.
- **Pelanggan:** tambah ke keranjang → checkout (isi lokasi & penerima) → pilih pembayaran & unggah bukti.
- **Sistem:** validasi ulang ketersediaan (transaksional) → keputusan **"Masih tersedia?"**
  - *Tidak* → selesai (jadwal bentrok/batal).
  - *Ya* → buat `Order` (PENDING) + hitung `pickupDate` → tampilkan konfirmasi.
- **Admin / Tim Lapangan:** verifikasi pembayaran → keputusan **"Bukti valid?"**
  - *Tidak* → tolak, minta unggah ulang (kembali ke pelanggan).
  - *Ya* → siklus status **CONFIRMED → SCHEDULED → INSTALLED → COMPLETED** (pasang di lokasi, lalu tutup pesanan setelah masa sewa selesai & kondisi unit dicek).

### 4.5 Tiga Titik Keputusan
Ketiga *decision* — **Tersedia?**, **Masih tersedia?**, dan **Bukti valid?** — merepresentasikan aturan bisnis & validasi utama, terutama validasi ganda ketersediaan untuk mencegah double-booking.

---

## 5. Keterkaitan Antar Diagram

Keempat diagram saling melengkapi dan memandang sistem dari sudut berbeda:

| Diagram | Pertanyaan yang dijawab | Sudut pandang |
|---------|------------------------|---------------|
| **Use Case** | *Siapa* melakukan *apa*? | Fungsional / pengguna |
| **Class** | *Apa* struktur datanya? | Struktur statis / basis data |
| **Sequence** | *Bagaimana* objek berkomunikasi pada satu skenario? | Interaksi teknis terhadap waktu |
| **Activity** | *Bagaimana* alur proses bisnis berjalan lintas peran? | Alur kerja dinamis |

Alur penurunan: kebutuhan fungsional pada **Use Case** dirinci proses bisnisnya di **Activity Diagram**, diwujudkan secara teknis pada **Sequence Diagram**, dan ditopang oleh struktur data pada **Class Diagram**.
