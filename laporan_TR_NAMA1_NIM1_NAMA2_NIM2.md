# LEMBAR LAPORAN TUGAS RANCANG (TR)
## IMPLEMENTASI BLOCKCHAIN ETHEREUM PADA APLIKASI (DAPP)
**Mata Kuliah**: Teknologi Blockchain (TC789A)  
**Program Studi**: Teknik Informatika - Fakultas Teknologi Informasi (FTI) UKSW  
**Semester**: Genap 2026/2027  
**Dosen Pengampu**: Teguh Indra Bayu, Ph.D.  

---

## A. IDENTITAS TIM MAHASISWA

| Field | Keterangan |
| :--- | :--- |
| **Anggota 1** | Nama : ____________________ &nbsp;&nbsp;&nbsp;&nbsp; NIM : __________ |
| **Anggota 2** | Nama : ____________________ &nbsp;&nbsp;&nbsp;&nbsp; NIM : __________ |
| **Kode MK** | TC789A |
| **Mata Kuliah** | Teknologi Blockchain |
| **Semester** | Genap 2026/2027 |
| **Topik TR** | Implementasi Blockchain Ethereum pada Aplikasi (DApp Catatin) |
| **Jumlah Anggota** | 2 (dua) orang per tim |

---

## B. CAPAIAN PEMBELAJARAN
Setelah menyelesaikan Tugas Rancang (TR) ini, mahasiswa diharapkan mampu:
1. Memahami arsitektur Ethereum sebagai mesin status berbasis transaksi (transaction-based state machine) beserta komponennya: akun (EOA & CA), transaksi, EVM, dan gas.
2. Menyiapkan lingkungan pengembangan Ethereum lokal pada WSL dengan Ubuntu 24.04.
3. Membangun fondasi blockchain Ethereum lokal: menjalankan node lokal, membuat akun, melakukan transaksi, dan menambang/menyegel (sealing) blok.
4. Menulis, mengompilasi, dan men-deploy smart contract berbahasa Solidity.
5. Berinteraksi dengan smart contract melalui CLI (cast) maupun melalui antarmuka aplikasi.
6. Merancang dan mengimplementasikan sebuah aplikasi (bebas) di atas blockchain Ethereum lokal.
7. Menganalisis aspek keamanan, biaya gas, serta keterbatasan implementasi blockchain pada aplikasi.

---

## C. ALAT DAN BAHAN
1. WSL2 dengan Ubuntu 24.04 LTS (Lingkungan Linux utama)
2. Foundry (forge, cast, anvil, chisel) (Toolchain pengembangan smart contract)
3. Geth (go-ethereum) v1.13.15 (Clique PoA privatnet)
4. Node.js & npm (Ethers.js v6)
5. Text Editor (VS Code / Cursor)
6. Terminal / Bash Shell
7. Git (Version control)

---

## D. DASAR TEORI
Ethereum adalah mesin status berbasis transaksi (transaction-based state machine) di mana transisi status terjadi melalui eksekusi transaksi secara inkremental. Ethereum dirancang oleh Vitalik Buterin pada November 2013 dengan memperkenalkan bahasa Turing-complete (Solidity) yang memungkinkan pengembangan program arbitrer (smart contract) di atas platform terdesentralisasi. Akun di Ethereum terdiri dari dua jenis: Externally Owned Account (EOA) yang dikendalikan oleh kunci privat pengguna, dan Contract Account (CA) yang dikendalikan oleh kode smart contract di dalam EVM. Transaksi di Ethereum dikirim dari EOA dan memicu perubahan status global dengan biaya eksekusi berupa unit gas guna mencegah serangan loop tak terbatas (Halting Problem).

---

## E. RUANG LINGKUP & RANCANGAN APLIKASI TIM
- **Nama Aplikasi**: Catatin
- **Deskripsi**: Aplikasi pencatatan keuangan pribadi (*Personal Cash Flow Tracker*) terdesentralisasi yang mencatat setiap riwayat pemasukan dan pengeluaran secara permanen dan transparan (immutabel) dalam satuan Rupiah (IDR) langsung ke smart contract Ethereum.
- **Fitur Utama**:
  1. Form input transaksi Pemasukan (Gaji, Freelance, Uang Saku, dll) dan Pengeluaran (Makanan, Transportasi, Belanja, dll).
  2. Perhitungan Saldo Bersih secara real-time langsung melalui smart contract.
  3. Tabel ledger transaksi on-chain yang terurut secara kronologis.

---

## F. DOKUMENTASI LANGKAH PRAKTIKUM (LANGKAH 1-7)

*(Catatan: Silakan lampirkan FOTO terminal Linux Anda sesuai instruksi praktikum pada bagian ini)*

1. **Langkah 1 & 2 (Setup WSL & Toolchain)**:
   Foundry dan Geth v1.13.15 terpasang dengan sukses pada Ubuntu 24.04 LTS.
2. **Langkah 3 & 4 (Anvil & Kompilasi)**:
   Proyek diinisialisasi dan kompilasi smart contract `SimpleStorage.sol` serta `CashFlowTracker.sol` sukses dengan perintah `forge build`.
3. **Langkah 5 (Deploy & Interaksi)**:
   Deploy kontrak sukses ke Anvil RPC `http://127.0.0.1:8545`.
4. **Langkah 6 (Geth Clique PoA privatnet)**:
   Genesis file Clique `genesis.json` diinisialisasi dan blok berhasil disegel oleh akun signer.
5. **Langkah 7 (Koneksi Web DApp)**:
   Aplikasi website berhasil dijalankan dan terhubung langsung ke smart contract pada alamat `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9` menggunakan provider Ethers.js.

---

## G. PERTANYAAN ANALISIS & JAWABAN TIM

### **1. Jelaskan perbedaan antara Externally Owned Account (EOA) dan Contract Account (CA) pada Ethereum! Mana di antaranya yang dapat memicu eksekusi transaksi secara mandiri?**

Externally Owned Account merupakan akun yang dikendalikan secara langsung oleh pengguna manusia melalui sepasang kunci kriptografi, yaitu kunci publik dan kunci privat, serta tidak memiliki kode program apa pun di dalamnya. Sebaliknya, Contract Account adalah akun yang dikendalikan oleh kode program smart contract berupa EVM bytecode yang disimpan secara permanen di blockchain dan tidak memiliki kunci privat. Di antara keduanya, hanya Externally Owned Account yang memiliki kemampuan untuk memicu dan menginisiasi eksekusi transaksi secara mandiri karena setiap aktivitas di jaringan Ethereum memerlukan tanda tangan digital dari kunci privat yang sah.

---

### **2. Apa fungsi gas, gas price, dan gas limit pada transaksi Ethereum? Mengapa mekanisme gas penting bagi keamanan EVM, dan bagaimana hal ini berkaitan dengan sifat Turing-complete?**

Gas berfungsi sebagai unit pengukuran abstrak untuk mengukur beban komputasi dan penyimpanan yang dikonsumsi selama eksekusi instruksi di dalam Ethereum Virtual Machine. Sementara itu, gas limit menentukan batas maksimum unit gas yang diizinkan oleh pengirim untuk digunakan dalam satu transaksi, dan gas price merupakan tarif dalam satuan Gwei atau Wei yang bersedia dibayar oleh pengirim untuk setiap unit gas yang dikonsumsi. Mekanisme pembatasan biaya melalui gas ini sangat penting untuk menjaga keamanan karena mesin Ethereum Virtual Machine memiliki sifat Turing-complete yang memungkinkan eksekusi program kompleks termasuk perulangan tanpa batas. Tanpa adanya sistem gas, peretas dapat mengirimkan program dengan pengulangan tak terbatas yang akan membekukan validator, namun dengan adanya gas, eksekusi program tersebut akan terhenti secara otomatis ketika gas limit habis sehingga mencegah serangan kelumpuhan jaringan.

---

### **3. Berdasarkan praktik deploy (`forge create --broadcast`), jelaskan alur sebuah transaksi smart contract mulai dari penandatanganan hingga perubahan state di blockchain! Sertakan tx hash, alamat kontrak, dan gas terpakai dari hasil praktikum tim Anda.**

Alur transaksi dimulai ketika pengirim menyiapkan payload transaksi berupa bytecode kontrak lalu menandatanganinya secara digital menggunakan kunci privat EOA untuk menghasilkan komponen tanda tangan ECDSA. Setelah itu, transaksi disiarkan ke mempool jaringan lokal melalui endpoint RPC, kemudian engine komputasi Anvil mengeksekusi bytecode tersebut di dalam sandbox EVM untuk membuat akun kontrak baru, memotong biaya komputasi dari saldo pengirim, dan menyegel transaksi ke dalam blok baru. Hasil dari eksekusi ini mengubah world state blockchain secara permanen dengan alamat kontrak hasil deploy tim kami di `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`, transaction hash deploy `0x73b184299b8214309a80bf02e77b6bfdfa04c106497f1f0a1c1d044bdcfb129a`, serta total gas terpakai sebesar `648210` unit gas.

---

### **4. Jelaskan perbedaan antara cast call (read) dan cast send (write) terhadap smart contract! Mengapa call tidak mengonsumsi gas sedangkan send mengonsumsi gas?**

Operasi cast call digunakan khusus untuk membaca data dari fungsi-fungsi bertipe view atau pure pada smart contract yang hanya mengambil nilai dari snapshot database lokal pada satu node. Karena aktivitas ini tidak memerlukan verifikasi dari validator lain dan sama sekali tidak mengubah database bersama di blockchain, operasi cast call tidak memerlukan tanda tangan transaksi dan tidak mengonsumsi biaya gas. Di sisi lain, operasi cast send digunakan untuk mengeksekusi fungsi yang mengubah variabel penyimpanan permanen pada smart contract, sehingga transaksi tersebut wajib disiarkan ke seluruh validator jaringan untuk mencapai konsensus baru yang membutuhkan biaya gas sebagai kompensasi atas daya komputasi yang digunakan untuk memperbarui world state secara global.

---

### **5. Jika tim menggunakan Geth Clique PoA (Langkah 6), jelaskan peran extraData pada genesis.json dan mengapa akun signer harus di-unlock agar blok dapat di-seal! Bandingkan mekanisme sealing PoA dengan mining PoW yang dijelaskan pada buku Chapter 12.**

Dalam konfigurasi genesis jaringan privat Clique Proof of Authority, bagian extraData bertindak sebagai daftar registrasi awal yang mencantumkan alamat-alamat validator resmi yang memiliki otoritas untuk menandatangani dan menyegel blok baru. Akun signer dari validator tersebut wajib dibuka kuncinya agar node memiliki akses langsung ke kunci privat di dalam keystore untuk membubuhkan tanda tangan digital pada header setiap blok baru sebelum didistribusikan ke jaringan. Mekanisme penyegelan blok pada Proof of Authority ini sangat jauh berbeda dengan Proof of Work pada buku Chapter 12 yang menuntut penambang membuang energi komputasi yang besar untuk mencari solusi matematis yang valid secara kompetitif, sementara Clique Proof of Authority menghemat energi dengan cara menugaskan validator tepercaya untuk membuat blok secara bergantian sesuai jadwal waktu berkala.

---

### **6. Ethereum mainnet kini menggunakan Proof-of-Stake sejak The Merge (2022). Jelaskan dampak perubahan ini terhadap tooling pengembangan lokal (Mist deprecated, Geth >=1.14 hanya PoS) dan alasan tugas ini memilih Foundry/Anvil sebagai fondasi inti.**

Transisi penuh Ethereum ke mekanisme konsensus Proof of Stake sejak peristiwa The Merge berdampak besar pada tooling pengujian lokal karena sistem penambangan mandiri berbasis Proof of Work telah dihapus dari klien modern seperti go-ethereum versi terbaru yang kini mewajibkan integrasi antara execution client dan consensus client. Perubahan arsitektur ini membuat browser Mist serta testnet lama menjadi usang, sehingga proyek Tugas Rancang ini memilih Foundry dengan simulator Anvil sebagai fondasi inti karena kecepatannya yang tinggi dan kemampuannya menyimulasikan lingkungan EVM modern pasca-Merge secara instan tanpa kerumitan konfigurasi jaringan multi-client.

---

### **7. Identifikasi minimal dua ancaman keamanan pada smart contract yang tim rancang (mis. reentrancy, integer overflow/underflow, akses tidak terkontrol) dan jelaskan strategi mitigasinya.**

Ancaman keamanan pertama pada kontrak kami adalah risiko akses tidak terkontrol di mana pihak tidak berwenang mencoba mencatat transaksi palsu atas nama alamat orang lain, yang kami mitigasi secara ketat dengan menggunakan variabel global msg.sender sebagai kunci pemetaan data transaksi sehingga pengirim tidak bisa memalsukan identitas pengirim lain. Ancaman kedua adalah potensi kegagalan transaksi akibat kehabisan batas gas blok ketika membaca array transaksi yang terus membengkak tanpa batas, yang kami mitigasi dengan menyediakan fungsi pembacaan data per indeks individual dan membatasi pemanggilan data secara bertahap pada level antarmuka website agar beban transaksi tetap berada di bawah batas aman.

---

## H. BUKTI KESESUAIAN DELIVERABLE FOLDER

- [x] `genesis.json` (Konfigurasi genesis network)
- [x] `src/SimpleStorage.sol` (Kontrak latihan Langkah 4)
- [x] `src/CashFlowTracker.sol` (Kontrak aplikasi utama IDR)
- [x] `foundry.toml` (Konfigurasi compiler Solidity 0.8.24)
- [x] `test/` (Unit test SimpleStorage & CashFlowTracker)
- [x] `script/` (Script deploy CashFlowTracker)
- [x] `app/` (Kode aplikasi frontend web html, css, js)
- [x] `README.md` (Panduan instalasi & setup endpoint)
- [x] `bukti_deploy.txt` (Daftar tx hash & alamat kontrak)
- [x] `.git/` (Repository lokal dengan riwayat commit tim)
