# Activity Diagram — Sistem Sewa Papan Bunga (Daffa Florist)

**Sumber:** [ERD-papan-bunga-sewa.md](ERD-papan-bunga-sewa.md) · [PRD-papan-bunga-sewa.md](PRD-papan-bunga-sewa.md)
**Tanggal:** 3 Juni 2026
**Status:** Draft

> Diagram memakai sintaks **Mermaid** (`flowchart`). Lihat bagian [Cara membuka](#cara-membuka-agar-terlihat-jelas) di bawah.

---

## 1. Alur Utama — Pemesanan Sewa (Pelanggan → Admin)

Dari awal pelanggan memilih produk sampai unit dikembalikan & deposit beres. Kolom (swimlane) menunjukkan siapa aktornya.

```mermaid
flowchart TD
    Start([Mulai]) --> Browse[Pelanggan: pilih produk papan bunga]
    Browse --> Detail[Isi form sewa:<br/>ukuran, template, warna,<br/>boardMessage, installDate, rentalDays]
    Detail --> CalcPickup["Server: hitung pickupDate<br/>= installDate + rentalDays"]
    CalcPickup --> CheckAvail{Cek ketersediaan<br/>periode tumpang tindih<br/>+ buffer 1 hari}

    CheckAvail -- Penuh --> Suggest[Tampilkan tanggal/unit<br/>alternatif] --> Detail
    CheckAvail -- Tersedia --> AddCart[Tambah ke keranjang]

    AddCart --> MoreItem{Tambah item lain?}
    MoreItem -- Ya --> Browse
    MoreItem -- Tidak --> Checkout[Isi alamat acara + eventDate]

    Checkout --> Summary["Ringkasan biaya:<br/>total = subtotal + shippingCost<br/>+ rentalDeposit − discount"]
    Summary --> CreateOrder["Server: createRental<br/>Order status = PENDING<br/>alokasi ProductUnit (opsional)"]

    CreateOrder --> PayDP[Pelanggan: bayar DP/penuh + deposit<br/>unggah bukti transfer]
    PayDP --> PendingVerif["Payment status = PENDING"]

    PendingVerif --> AdminVerif{Admin verifikasi bukti}
    AdminVerif -- Ditolak --> Reject["Payment = REJECTED<br/>minta bukti ulang"] --> PayDP
    AdminVerif -- Valid --> Confirmed["Payment = VERIFIED<br/>Order → CONFIRMED"]

    Confirmed --> Schedule[Admin tetapkan jadwal pasang<br/>Order → SCHEDULED]
    Schedule --> Install[Tim lapangan pasang di lokasi<br/>Order → INSTALLED]
    Install --> Display[Papan tampil selama rentalDays]
    Display --> Pickup[Tim ambil kembali unit<br/>Order → PICKED_UP]
    Pickup --> Inspect{Cek kondisi unit}

    Inspect -- Rusak --> Claim[Potong/klaim dari deposit] --> Returned
    Inspect -- Baik --> Returned["Unit kembali<br/>ProductUnit → AVAILABLE<br/>Order → RETURNED"]

    Returned --> Refund[Kembalikan deposit<br/>Payment DEPOSIT_REFUND<br/>depositRefunded = true]
    Refund --> Complete["Order → COMPLETED"]
    Complete --> End([Selesai])
```

---

## 2. Sub-alur — Cek Ketersediaan (logika inti §4 ERD)

```mermaid
flowchart TD
    Start([Minta sewa produk+sizeLabel<br/>periode requestStart..requestEnd]) --> Buffer[Tambahkan buffer ±1 hari]
    Buffer --> Query["Ambil OrderItem aktif<br/>(status ≠ CANCELLED/COMPLETED)<br/>yang tumpang tindih"]
    Query --> Overlap{"requestStart ≤ existingEnd<br/>DAN<br/>requestEnd ≥ existingStart?"}

    Overlap -- Tidak ada yang tumpang tindih --> Available([TERSEDIA])
    Overlap -- Ada --> Count{Jumlah item tumpang tindih<br/>≥ jumlah ProductUnit?}

    Count -- Ya --> Full([PENUH])
    Count -- Tidak --> Available
```

---

## 3. Sub-alur — Perubahan Status & Pembayaran (sisi Admin)

```mermaid
flowchart LR
    subgraph Status["Alur status pesanan"]
        direction LR
        P[PENDING] --> C[CONFIRMED] --> S[SCHEDULED] --> I[INSTALLED] --> PU[PICKED_UP] --> R[RETURNED] --> CO[COMPLETED]
        P -. batal .-> X[CANCELLED]
        C -. batal .-> X
        S -. batal .-> X
        I -. batal .-> X
    end

    subgraph Audit["Setiap perubahan"]
        H["Catat OrderStatusHistory<br/>(fromStatus, toStatus,<br/>changedBy, createdAt)"]
    end

    Status -.otomatis.-> Audit
```

---

## Cara membuka agar terlihat jelas

File ini pakai **Mermaid**, jadi bisa langsung dirender (tidak perlu tool berbayar):

| Cara | Langkah |
|------|---------|
| **VS Code (rekomendasi)** | Install extension **"Markdown Preview Mermaid Support"** (bierner). Lalu buka file ini → `Cmd+Shift+V` untuk preview. Diagram langsung tampil. |
| **GitHub / GitLab** | Push file `.md` ini — Mermaid otomatis dirender di tampilan repo (tanpa setup apa pun). |
| **mermaid.live** | Buka <https://mermaid.live>, copy-paste isi satu blok ```mermaid``` → render + export PNG/SVG. Paling enak untuk presentasi/cetak. |
| **Export gambar** | Dari mermaid.live klik *Actions → PNG/SVG*, atau pakai CLI `@mermaid-js/mermaid-cli` (`mmdc -i file.md -o diagram.png`). |

> **Tips:** untuk preview di VS Code yang paling mulus, extension **"Mermaid Markdown Syntax Highlighting"** + **"Markdown Preview Mermaid Support"** sudah cukup. Kalau ingin diagram interaktif/zoom, mermaid.live paling nyaman.
