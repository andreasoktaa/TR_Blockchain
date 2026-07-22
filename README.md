# EtherFlow — Decentralized Personal Cash Flow Tracker DApp (IDR Rupiah Edition)

**Tugas Rancang (TR) Teknologi Blockchain (TC789A)**  
**Fakultas Teknologi Informasi — Universitas Kristen Satya Wacana (UKSW)**  
**Dosen Pengampu**: Teguh Indra Bayu, Ph.D.  
**Semester**: Genap 2026/2027  

---

## 📌 Deskripsi Proyek

**EtherFlow** adalah aplikasi *Personal Cash Flow Tracker* terdesentralisasi berbasis Rupiah (IDR) di atas Ethereum lokal (Foundry Anvil / Geth Private Network). Aplikasi ini memungkinkan pengguna untuk mencatat transaksi keuangan (pemasukan & pengeluaran) dalam satuan Rupiah (misal Rp 10.000 untuk makanan, Rp 5.000 untuk transportasi) secara immutabel, transparan, dan aman di dalam *world state* Ethereum Virtual Machine (EVM).

Setiap transaksi dipancarkan melalui **event `TransactionAdded`** dan riwayat keuangan dipetakan per *address* pengguna, sehingga saldo bersih (*Net Balance*) dihitung secara otomatis dan akurat.

---

## 🏗️ Struktur Proyek

```
New project/
├── foundry.toml                # Konfigurasi Foundry (Solidity 0.8.24)
├── genesis.json                # Genesis file Clique PoA untuk Geth Private Net (Langkah 6)
├── bukti_deploy.txt            # Alamat kontrak, Tx Hash, Gas Used, & Bukti Read/Write
├── README.md                   # Panduan setup & pengoperasian DApp
├── Laporan_TR_Dokumentasi.md   # Laporan lengkap & Jawaban 7 Pertanyaan Analisis (Bagian G)
├── src/
│   ├── SimpleStorage.sol       # Kontrak dasar latihan Langkah 4
│   └── CashFlowTracker.sol     # Smart contract aplikasi utama (Mata uang IDR)
├── test/
│   ├── SimpleStorage.t.sol     # Unit test Forge untuk SimpleStorage
│   └── CashFlowTracker.t.sol   # Unit test Forge untuk CashFlowTracker (IDR)
├── script/
│   └── DeployCashFlowTracker.s.sol # Script deployment Forge
└── app/
    ├── index.html              # Antarmuka Web App (Glassmorphism Dark Mode)
    ├── styles.css              # Custom Design System & CSS animations
    └── app.js                  # Logika integrasi Ethers.js v6 (Format Rupiah)
```

---

## ⚡ Panduan Setup & Pengoperasian

### 1. Prasyarat Lingkungan (WSL Ubuntu 24.04)

Pastikan toolchain Foundry telah terpasang pada WSL Ubuntu 24.04:
```bash
# Update & install dependencies
sudo apt update && sudo apt install -y build-essential git curl jq

# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc && foundryup
```

---

### 2. Kompilasi & Unit Testing Smart Contract

Buka terminal pada direktori proyek dan jalankan perintah berikut:

```bash
# Build / Kompilasi smart contract
forge build

# Jalankan unit test
forge test -vvv
```

---

### 3. Jalankan Node Lokal Ethereum (Anvil)

Buka terminal tersendiri untuk menjalankan Anvil simulator node:
```bash
anvil
```

---

### 4. Deploy Smart Contract ke Anvil

Jalankan perintah berikut di terminal proyek (gunakan private key akun #0 Anvil):

```bash
# Set variabel Private Key Akun #0 Anvil
export PK=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Deploy SimpleStorage (Langkah 5)
forge create src/SimpleStorage.sol:SimpleStorage --rpc-url http://127.0.0.1:8545 --private-key $PK --broadcast

# Deploy CashFlowTracker (Smart Contract Aplikasi IDR)
forge create src/CashFlowTracker.sol:CashFlowTracker --rpc-url http://127.0.0.1:8545 --private-key $PK --broadcast
```
*Catat alamat **`Deployed to: 0x...`** dari output terminal.*

---

### 5. Interaksi via CLI (`cast`)

#### A. Transaksi Write (`cast send`)
```bash
# Tambah Pengeluaran Makanan (Rp 10.000)
cast send 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9 "addExpense(string,string,uint256)" "Makanan" "Makan Siang Nasi Goreng" 10000 --rpc-url http://127.0.0.1:8545 --private-key $PK

# Tambah Pengeluaran Transportasi (Rp 5.000)
cast send 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9 "addExpense(string,string,uint256)" "Transportasi" "Ongkos Angkot" 5000 --rpc-url http://127.0.0.1:8545 --private-key $PK

# Tambah Pemasukan Gaji (Rp 3.000.000)
cast send 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9 "addIncome(string,string,uint256)" "Gaji" "Gaji Bulanan" 3000000 --rpc-url http://127.0.0.1:8545 --private-key $PK
```

#### B. Transaksi Read (`cast call`)
```bash
# Query Saldo (Income, Expense, NetBalance IDR)
cast call 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9 "getBalance(address)(uint256,uint256,int256)" 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --rpc-url http://127.0.0.1:8545
```

---

### 6. Menjalankan Antarmuka Web Application (`app/`)

1. Buka file [`app/index.html`](file:///c:/Users/JOJO/Documents/New%20project/app/index.html) langsung di web browser.
2. Field **RPC Endpoint**: `http://127.0.0.1:8545`.
3. Tempelkan alamat Smart Contract hasil deploy ke input **Alamat Smart Contract**.
4. Klik tombol **"Hubungkan Node"**.
5. Cobalah menambah transaksi (misal Rp 10.000 Makanan dan Rp 5.000 Transportasi) dan lihat pembaruan statistik Rupiah secara real-time.
