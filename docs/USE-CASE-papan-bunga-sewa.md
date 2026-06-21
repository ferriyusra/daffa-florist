# Use Case Diagram — Sistem Sewa Papan Bunga (Daffa Florist)

**Sumber:** [PRD-papan-bunga-sewa.md](PRD-papan-bunga-sewa.md) §4–§6 · [ERD-papan-bunga-sewa.md](ERD-papan-bunga-sewa.md)
**Tanggal:** 21 Juni 2026
**Status:** Draft

> Diagram disusun **berbasis peran (role-based)**: tiap aktor punya kelompok use case sendiri.
> Aktor diturunkan dari PRD §4 (Persona), use case dari PRD §5 (Fitur) & §6 (Alur).

---

## 1. Aktor & Perannya

| Aktor | Peran | Hak akses |
|-------|-------|-----------|
| **User (Pelanggan)** | Memesan & menyewa papan bunga, bayar, lacak pesanan | `public` + login (`protected`) |
| **Admin** | Kelola katalog, unit, pesanan, pembayaran, jadwal | `admin` |
| **Tim Lapangan** | *Spesialisasi Admin* — eksekusi pasang/ambil di lapangan | `admin` (subset operasional) |

> **Tim Lapangan** adalah generalisasi/turunan dari **Admin**: ia mewarisi akses admin tetapi hanya memakai use case operasional lapangan.

---

## 2. Diagram Use Case (Mermaid)

```mermaid
flowchart LR
    %% ================= AKTOR =================
    User([User / Pelanggan])
    Admin([Admin])
    Lapangan([Tim Lapangan])

    %% generalisasi: Tim Lapangan adalah Admin
    Lapangan -. "is-a" .-> Admin

    %% ============ USE CASE: USER ============
    subgraph U[" Peran USER "]
        direction TB
        U1([Registrasi / Login])
        U2([Kelola Alamat])
        U3([Telusuri Katalog & Detail Produk])
        U4([Pilih Periode Sewa])
        U5([Lihat Ketersediaan Unit])
        U6([Kelola Keranjang])
        U7([Checkout & Buat Pesanan])
        U8([Bayar + Unggah Bukti])
        U9([Lacak Status Pesanan])
        U10([Batalkan Pesanan])
    end

    %% ============ USE CASE: ADMIN ============
    subgraph A[" Peran ADMIN "]
        direction TB
        A1([Kelola Katalog Produk])
        A2([Kelola Inventaris Unit])
        A3([Lihat Kalender Pesanan])
        A4([Verifikasi Pembayaran])
        A5([Ubah Status Pesanan])
        A6([Atur Jadwal Pasang / Bongkar])
        A7([Atur Ongkir per Zona])
        A8([Selesaikan Pesanan])
    end

    %% ======= USE CASE: TIM LAPANGAN =======
    subgraph L[" Peran TIM LAPANGAN "]
        direction TB
        L1([Lihat Tugas Pasang / Ambil Harian])
        L2([Tandai Terpasang - INSTALLED])
        L3([Catat Kondisi Unit saat Kembali])
    end

    %% ---------- asosiasi USER ----------
    User --- U1
    User --- U2
    User --- U3
    User --- U4
    User --- U6
    User --- U7
    User --- U8
    User --- U9
    User --- U10

    %% ---------- asosiasi ADMIN ----------
    Admin --- A1
    Admin --- A2
    Admin --- A3
    Admin --- A4
    Admin --- A5
    Admin --- A6
    Admin --- A7
    Admin --- A8

    %% ---------- asosiasi TIM LAPANGAN ----------
    Lapangan --- L1
    Lapangan --- L2
    Lapangan --- L3

    %% ---------- include / extend ----------
    U4 -. include .-> U5
    U7 -. include .-> U1
    U7 -. include .-> U5
    U7 -. include .-> U8
    A4 -. include .-> A5
    A6 -. extend .-> A5
    L2 -. extend .-> A5
    A8 -. include .-> L3
    U7 -. extend .-> A7
```

---

## 3. Rincian Use Case per Peran

### 3.1 User (Pelanggan)
| Use Case | Fitur PRD | API tRPC |
|----------|-----------|----------|
| Registrasi / Login | F6 | `auth.register`, NextAuth |
| Kelola Alamat | F6 | Address CRUD |
| Telusuri Katalog & Detail Produk | F1 | `product.list`, `product.getBySlug` |
| Pilih Periode Sewa | F2 | `rental.getBookedDates` |
| Lihat Ketersediaan Unit | F2, §6.3 | `rental.checkAvailability` |
| Kelola Keranjang | F4 | client `useCart` |
| Checkout & Buat Pesanan | F4, §6.1 | `order.createRental` |
| Bayar + Unggah Bukti | F4 | Payment |
| Lacak Status Pesanan | F5 | `order.listMine` |
| Batalkan Pesanan | §10.3 | `admin.order.updateStatus` |

### 3.2 Admin
| Use Case | Fitur PRD | API tRPC |
|----------|-----------|----------|
| Kelola Katalog Produk | A1 | `admin.product.*` |
| Kelola Inventaris Unit | A1 | `admin.unit.*` |
| Lihat Kalender Pesanan | A2 | `admin.calendar`, `admin.order.list` |
| Verifikasi Pembayaran | A2 | `admin.order.updateStatus` |
| Ubah Status Pesanan | A2 | `admin.order.updateStatus` → `OrderStatusHistory` |
| Atur Jadwal Pasang / Bongkar | A3 | `admin.order.updateStatus` |
| Atur Ongkir per Zona | §10.8 | manual, `Order.shippingCost` |
| Selesaikan Pesanan | A4 | `admin.order.updateStatus` |

### 3.3 Tim Lapangan *(spesialisasi Admin)*
| Use Case | Fitur PRD | API tRPC |
|----------|-----------|----------|
| Lihat Tugas Pasang / Ambil Harian | A3 | `admin.calendar` (filter tanggal) |
| Tandai Terpasang (INSTALLED) | A3, §6.2 | `admin.order.updateStatus` |
| Catat Kondisi Unit saat Kembali | A3 | `ProductUnit.status` |

---

## 4. Catatan Relasi

- **Generalisasi** — *Tim Lapangan* **is-a** *Admin*: punya akun admin, tapi perannya dibatasi ke use case lapangan.
- **`<<include>>`** (wajib selalu jalan):
  *Checkout* → *Login* + *Lihat Ketersediaan* + *Bayar*; *Verifikasi Pembayaran* → *Ubah Status*; *Selesaikan Pesanan* → *Catat Kondisi Unit*.
- **`<<extend>>`** (kondisional):
  *Atur Jadwal* & *Tandai Terpasang* memperluas *Ubah Status* (transisi `SCHEDULED`/`INSTALLED`); *Atur Ongkir per Zona* memperluas *Checkout* (rilis awal manual, PRD §10.8).
- **Anti double-booking (PRD §6.3 & §8):** ketersediaan dicek dua kali — saat *Pilih Periode Sewa* (pratinjau) dan **divalidasi ulang transaksional** saat *Checkout & Buat Pesanan*.
