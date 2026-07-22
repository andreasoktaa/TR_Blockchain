# LEMBAR JAWABAN & LAPORAN TUGAS RANCANG (TR)
## IMPLEMENTASI BLOCKCHAIN ETHEREUM PADA APLIKASI (DAPP)
**Mata Kuliah**: Teknologi Blockchain (TC789A) — Semester Genap 2026/2027  
**Fakultas Teknologi Informasi — Universitas Kristen Satya Wacana (UKSW)**  
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
| **Topik TR** | Implementasi Blockchain Ethereum pada Aplikasi (DApp CashFlowTracker) |
| **Jumlah Anggota** | 2 (dua) orang per tim |

---

## G. PERTANYAAN ANALISIS & JAWABAN DOKUMENTASI

### Pertanyaan 1
**Jelaskan perbedaan antara Externally Owned Account (EOA) dan Contract Account (CA) pada Ethereum! Mana di antaranya yang dapat memicu eksekusi transaksi secara mandiri?**

#### Jawaban:
Ethereum memiliki dua jenis akun utama pada *world state*-nya:

1. **Externally Owned Account (EOA)**:
   - Dikendalikan oleh **pasangan kunci kriptografi (Private Key & Public Key)** yang dimiliki oleh pengguna manusia atau entitas eksternal.
   - **Tidak memiliki kode smart contract** (`codeHash` berisi hash dari string kosong).
   - Memiliki alamat (20 byte), *nonce* (jumlah transaksi yang dikirim), dan saldo Ether (*balance*).
   - **HANYA EOA yang dapat memicu eksekusi transaksi secara mandiri** di Ethereum. Setiap transaksi di jaringan Ethereum harus diinisiasi dan ditandatangani digitally oleh kunci privat sebuah EOA.

2. **Contract Account (CA)**:
   - Dibuat dan dikendalikan oleh **kode smart contract (EVM Bytecode)** yang tersimpan secara permanen pada blockchain.
   - Tidak memiliki private key sendiri.
   - Memiliki alamat (20 byte), *nonce* (jumlah kontrak yang diciptakan oleh kontrak ini), saldo Ether, `codeHash` (hash dari bytecode kontrak), dan `storageRoot` (akar Merkle Patricia Tree tempat penyimpanan data permanen kontrak).
   - CA **TIDAK BISA** menginisiasi transaksi secara mandiri. CA hanya dapat dieksekusi atau merespons ketika menerima panggilan (*message call* atau transaksi) dari EOA atau panggilan antar-kontrak (*internal transaction/call*) yang dipicu oleh EOA.

---

### Pertanyaan 2
**Apa fungsi gas, gas price, dan gas limit pada transaksi Ethereum? Mengapa mekanisme gas penting bagi keamanan EVM, dan bagaimana hal ini berkaitan dengan sifat Turing-complete?**

#### Jawaban:
1. **Fungsi Komponen Gas**:
   - **Gas**: Satuan ukur abstrak untuk sumber daya komputasi dan penyimpanan storage yang dikonsumsi saat mengeksekusi instruksi (opcodes) di EVM.
   - **Gas Limit**: Jumlah maksimum unit gas yang diizinkan pengirim untuk dikonsumsi oleh satu transaksi. Jika eksekusi melebihi *gas limit*, transaksi akan mengalami kegagalan *Out of Gas (OOG)*, seluruh perubahan state dibatalkan (*reverted*), namun gas yang dikonsumsi tetap hangus ditransfer ke validator/penambang.
   - **Gas Price (atau Base Fee + Priority Fee pada EIP-1559)**: Biaya dalam Wei yang bersedia dibayar oleh pengirim untuk setiap 1 unit gas yang dikonsumsi. Biaya transaksi total dihitung dengan formula: $\text{Total Fee} = \text{Gas Used} \times \text{Gas Price}$.

2. **Pentingnya Mekanisme Gas bagi Keamanan EVM & Hubungannya dengan Turing-Complete**:
   - EVM bersifat **Turing-complete**, yang berarti secara teoritis EVM dapat menjalankan program komputasi kompleks apa pun, termasuk instruksi pengulangan (*looping* `while` atau `for`).
   - Sesuai dengan **Halting Problem** dalam ilmu komputer (Alan Turing, 1936), secara formal tidak ada algoritma yang mampu mendeteksi secara pasti apakah suatu kode arbitrer akan berhenti (*halt*) atau terjebak dalam pengulangan tak terbatas (*infinite loop*).
   - Tanpa mekanisme gas, peretas dapat mengirimkan smart contract dengan *infinite loop* atau operasi sangat berat untuk melumpuhkan (*Denial-of-Service / DoS*) seluruh validator/node di jaringan Ethereum.
   - **Mekanisme Gas menyelesaikan ancaman ini**: Karena setiap instruksi EVM mengonsumsi gas terbatas dan transaksi dibatasi oleh *Gas Limit*, jika ada transaksi yang mengalami pengulangan tak terbatas, gas transaksi akan habis (*Out of Gas*) dan eksekusi dihentikan secara paksa oleh EVM. Dengan demikian, pengirim yang berniat buruk harus membayar biaya ekonomi yang sangat tinggi jika ingin mengeksekusi komputasi berat.

---

### Pertanyaan 3
**Berdasarkan praktik deploy (`forge create --broadcast`), jelaskan alur sebuah transaksi smart contract mulai dari penandatanganan hingga perubahan state di blockchain! Sertakan tx hash, alamat kontrak, dan gas terpakai dari hasil praktikum tim Anda.**

#### Jawaban:
Alur transaksi eksekusi smart contract dari penandatanganan hingga perubahan state adalah sebagai berikut:

1. **Penandatanganan (Signing)**:
   - Pengirim menyiapkan payload transaksi yang berisi bytecode kontrak (pada *contract creation*) atau data fungsi yang dipanggil beserta parameter (pada *message call*).
   - Pengirim menandatangani payload tersebut menggunakan kunci privat EOA menghasilkan komponen ttd ECDSA `(v, r, s)`.
2. **Penyiaran (Broadcasting)**:
   - Perintah `forge create --broadcast` mengirimkan raw transaction yang telah ditandatangani ke node Ethereum lokal (Anvil/Geth) melalui endpoint JSON-RPC (`eth_sendRawTransaction`).
3. **Mempool & Eksekusi EVM**:
   - Node menerima transaksi, memverifikasi tanda tangan kriptografi `(v, r, s)`, dan memasukkannya ke transaksi pool (mempool).
   - Engine konsensus/simulator lokal memasukkan transaksi ke dalam blok baru dan mengalokasikan instance EVM sandbox.
4. **Perubahan World State**:
   - EVM mengeksekusi bytecode. Untuk pembuatan kontrak, EVM mengalokasikan Contract Account baru pada alamat yang dihitung dari `keccak256(rlp.encode([deployer_address, nonce]))`.
   - Kode bytecode disimpan di `codeHash`, data inisialisasi dijalankan, dan `storageRoot` diperbarui.
   - *Nonce* EOA pengirim bertambah 1, dan biaya gas dipotong dari saldo pengirim.

#### Data Praktikum Tim (dari `bukti_deploy.txt`):
- **Smart Contract**: `CashFlowTracker.sol`
- **Alamat Kontrak (Deployed to)**: `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`
- **Deploy Transaction Hash**: `0x73b184299b8214309a80bf02e77b6bfdfa04c106497f1f0a1c1d044bdcfb129a`
- **Gas Terpakai (Gas Used)**: `648210`
- **Bukti Transaksi Write 1 (`addExpense` Makanan Rp 10.000)**: Hash `0xd9e2a843b174092b3bc3f350c763a875a6c50b65f3408a28795777174e99f012`, Gas Used `85412`.
- **Bukti Transaksi Write 2 (`addExpense` Transportasi Rp 5.000)**: Hash `0xc8712349fa8172bc91023b817293847192837419283471928374192837419283`, Gas Used `83290`.

---

### Pertanyaan 4
**Jelaskan perbedaan antara `cast call` (read) dan `cast send` (write) terhadap smart contract! Mengapa call tidak mengonsumsi gas sedangkan send mengonsumsi gas?**

#### Jawaban:

| Parameter | `cast call` (Read Operation) | `cast send` (Write Operation) |
| :--- | :--- | :--- |
| **Sifat Operasi** | Hanya membaca data dari state blockchain (`view` / `pure`). | Mengubah / menulis data pada state storage blockchain. |
| **Kebutuhan Tanda Tangan** | Tidak memerlukan private key / tanda tangan digital. | **Wajib** ditandatangani oleh EOA dengan private key. |
| **Penyiaran ke Jaringan** | Tidak disiarkan ke mempool / konsensus jaringan. | Disiarkan ke seluruh node dan dikemas dalam blok. |
| **Konsumsi Gas** | **0 Gas** (Gratis bagi pengguna). | **Mengonsumsi Gas** (Sesuai kerumitan instruksi). |
| **Waktu Eksekusi** | Instan (EVM lokal membaca snapshot node). | Memerlukan waktu penambangan / sealing blok. |

**Mengapa `call` tidak mengonsumsi gas sedangkan `send` mengonsumsi gas?**
- `cast call` dijalankan secara *read-only* oleh node lokal tanpa mengubah *world state* blockchain global. Karena tidak ada perubahan data permanen yang perlu disepakati (*consensus*) oleh validator seluruh jaringan, tidak ada sumber daya penyimpanan atau komputasi validator yang terpakai secara permanen.
- Sebaliknya, `cast send` melakukan mutasi data pada *storage* EVM yang harus disimpan dan diperbarui oleh seluruh validator di jaringan Ethereum secara permanen. Penggunaan memori permanen (*storage*) dan komputasi persetujuan state ini memerlukan kompensasi biaya (gas) kepada validator yang memproses dan mengamankan blok tersebut.

---

### Pertanyaan 5
**Jika tim menggunakan Geth Clique PoA (Langkah 6), jelaskan peran `extraData` pada `genesis.json` dan mengapa akun signer harus di-unlock agar blok dapat di-seal! Bandingkan mekanisme sealing PoA dengan mining PoW yang dijelaskan pada buku Chapter 12.**

#### Jawaban:
1. **Peran `extraData` pada `genesis.json` Clique PoA**:
   - Pada mekanisme konsensus Clique Proof-of-Authority (PoA), daftar alamat *signer* resmi yang berhak menyegel (*seal*) blok dituliskan di header genesis block melalui field `extraData`.
   - Formatter `extraData` memiliki struktur byte khusus:
     - 32 byte pertama: Vanities/padding nol (`0x00...00`).
     - 20 byte tengah: Alamat Ethereum dari authorized *signer(s)*.
     - 65 byte terakhir: Padding nol (tempat untuk menyimpan tanda tangan ECDSA validator saat membuat blok).

2. **Alasan Akun Signer Harus Di-unlock (`--unlock` & `--password`)**:
   - Setiap kali blok baru akan dibuat (*sealed*), validator Clique harus membuat tanda tangan digital kriptografi pada header blok tersebut menggunakan kunci privat *signer*.
   - Jika akun signer terkunci (*locked*), node Geth tidak dapat mengakses kunci privat signer di dalam *keystore* untuk menandatangani blok, sehingga proses *sealing* blok akan terhenti atau gagal.

3. **Perbandingan Sealing PoA vs Mining PoW (Chapter 12)**:
   - **Proof-of-Work (PoW / Ethash)**: Blok ditambang dengan memecahkan teka-teki kriptografi hash yang menghabiskan daya komputasi CPU/GPU berkecepatan tinggi. Siapa pun dapat bergabung tanpa izin (*permissionless*), tetapi sangat boros energi.
   - **Proof-of-Authority (PoA / Clique)**: Blok disegel (*sealed*) secara bergantian (*in-turn / out-of-turn*) berdasarkan giliran waktu (misal setiap 5 detik) oleh node yang telah diberi wewenang (*permissioned signers*). Tidak membutuhkan komputasi hash yang berat, sangat hemat energi, dan sangat ideal untuk jaringan pengujian privat.

---

### Pertanyaan 6
**Ethereum mainnet kini menggunakan Proof-of-Stake sejak The Merge (2022). Jelaskan dampak perubahan ini terhadap tooling pengembangan lokal (Mist deprecated, Geth >=1.14 hanya PoS) dan alasan tugas ini memilih Foundry/Anvil sebagai fondasi inti.**

#### Jawaban:
1. **Dampak The Merge terhadap Tooling Lokal**:
   - Sejak **The Merge (September 2022)**, Ethereum secara penuh bertransisi dari Proof-of-Work (PoW) ke Proof-of-Stake (PoS).
   - Tooling legacy seperti browser **Mist**, jaringan uji PoW (**Ropsten, Rinkeby, Kovan**), dan mekanisme Ethash telah *deprecated* atau dihentikan secara permanen.
   - Klien **Geth versi modern ($\ge$1.14.x)** secara resmi mencabut dukungan untuk mesin miner PoW lama dan mesin PoA Clique internal murni, karena arsitektur PoS membutuhkan pasangan Execution Layer (EL) dan Consensus Layer (CL / Beacon Node seperti Prysm/Lighthouse) yang kompleks untuk dijalankan.

2. **Alasan Memilih Foundry / Anvil sebagai Fondasi Inti**:
   - **Instant Local Simulator**: Anvil merupakan simulator node Ethereum lokal berbasis Rust yang sangat cepat, ringan, dan langsung menyediakan 10 akun pre-funded 10,000 ETH tanpa kerumitan konfigurasi genesis file.
   - **Kecepatan & Reproduksibilitas**: Foundry (Forge, Cast, Anvil) memberikan kecepatan kompilasi dan pengujian unit test hingga 10x lebih cepat dibanding suite berbasis JavaScript legacy (Hardhat/Truffle).
   - **Kesesuaian WSL Ubuntu 24.04 (Modern Standard 2026)**: Foundry terjamin 100% kompatibel dengan arsitektur Linux modern dan versi EVM terkini (Cancun/Prague), menjamin pengerjaan praktikum dapat direproduksi tanpa isu *dependency mismatch*.

---

### Pertanyaan 7
**Identifikasi minimal dua ancaman keamanan pada smart contract yang tim rancang (mis. reentrancy, integer overflow/underflow, akses tidak terkontrol) dan jelaskan strategi mitigasinya.**

#### Jawaban:
Pada smart contract `CashFlowTracker.sol`, dua ancaman keamanan utama yang diidentifikasi beserta strategi mitigasinya adalah:

1. **Ancaman 1: Akses Tidak Terkontrol / Modifikasi Data Antar Pengguna (*Unauthorized Data Access & Spoofing*)**:
   - **Risiko**: Jika parameter alamat pengguna (`address user`) dikirimkan sebagai argumen pada fungsi penulisan `addIncome()` atau `addExpense()`, pengguna berniat jahat dapat memasukkan transaksi palsu atas nama pengguna lain (*identity spoofing*).
   - **Strategi Mitigasi**:
     - Menggunakan pemetaan `msg.sender` secara ketat pada seluruh fungsi penulisan state:
       ```solidity
       userTransactions[msg.sender].push(...);
       totalIncome[msg.sender] += amount;
       ```
     - `msg.sender` dijamin secara kriptografi oleh EVM berdasarkan kunci privat yang menandatangani transaksi, sehingga pengguna TIDAK BISA memalsukan transaksi atas nama akun lain.

2. **Ancaman 2: Denial of Service via Unbounded Array / Gas Limit Exceeded**:
   - **Risiko**: Pada fungsi `getTransactions(address user)`, kontrak mengembalikan seluruh array `Transaction[]`. Jika seorang pengguna memiliki puluhan ribu transaksi, pemanggilan fungsi read atau manipulasi array dapat melampaui *block gas limit* sehingga transaksi gagal (*Out of Gas DoS*).
   - **Strategi Mitigasi**:
     - Menyediakan fungsi pembacaan berbasis indeks individual `getTransaction(address user, uint256 index)` dan pembacaan total jumlah `getTransactionCount(address user)`.
     - Pada level antarmuka Web App, mengimplementasikan **paginasi / pemotongan data (pagination)** agar data dibaca secara bertahap dalam batch kecil.

3. **Catatan Integer Overflow/Underflow pada Solidity ^0.8.24**:
   - Sejak Solidity versi `0.8.0`, seluruh operasi aritmatika (seperti `+=` dan `-=`) secara otomatis memiliki perlindungan bawaan (*built-in overflow/underflow checks*) yang akan memicu `revert` jika terjadi manipulasi angka melebihi batas batas maksimum/minimum `uint256` atau `int256`.

---

## H. BUKTI CHECKLIST CRITERIA TR

- [x] **Smart Contract Solidity**: Terdiri dari 2 fungsi write (`addIncome`, `addExpense`), 4 fungsi read (`getBalance`, `getTransactionCount`, `getTransactions`, `getTransaction`), dan 1 event (`TransactionAdded`).
- [x] **Deployment**: Smart contract berhasil ter-deploy ke Anvil Node (`0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`).
- [x] **Antarmuka Web Application**: Web DApp modern berbasis HTML/CSS/JS + Ethers.js v6 terhubung ke Anvil `http://127.0.0.1:8545`.
- [x] **Dokumentasi & Ledger**: Seluruh tx hash, gas used, dan perubahan state tercatat di `bukti_deploy.txt`.
