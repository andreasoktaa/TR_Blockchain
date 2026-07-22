// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CashFlowTracker
 * @author Tim Mahasiswa UKSW - Tugas Rancang Teknologi Blockchain TC789A
 * @notice Smart contract untuk pencatatan transaksi pemasukan dan pengeluaran berbasis Rupiah (IDR) secara terdesentralisasi di Ethereum.
 */
contract CashFlowTracker {
    // Enum Jenis Transaksi: 0 = Income, 1 = Expense
    enum TransactionType { Income, Expense }

    // Struktur Data Transaksi (Nominal dalam mata uang Rupiah / IDR)
    struct Transaction {
        uint8 txType;          // 0: Income, 1: Expense
        string category;       // Kategori (mis. Gaji, Makanan, Transportasi, Belanja)
        string description;    // Deskripsi rincian transaksi
        uint256 amount;        // Jumlah nominal Rupiah / IDR (mis. 10000 untuk Rp 10.000)
        uint256 timestamp;     // Waktu blok transaksi tercatat (block.timestamp)
    }

    // Mapping per-address pengguna ke daftar transaksi mereka
    mapping(address => Transaction[]) private userTransactions;
    
    // Mapping per-address untuk total pemasukan dan pengeluaran (dalam IDR)
    mapping(address => uint256) private totalIncome;
    mapping(address => uint256) private totalExpense;

    // Event dipancarkan setiap ada transaksi baru
    event TransactionAdded(
        address indexed user,
        uint8 indexed txType,
        string category,
        string description,
        uint256 amount,
        uint256 timestamp
    );

    // Custom Errors untuk efisiensi gas
    error InvalidAmount();
    error EmptyCategory();
    error IndexOutOfBounds();

    /**
     * @notice Menambahkan transaksi Pemasukan (Income) dalam Rupiah (IDR)
     * @param category Kategori pemasukan
     * @param description Deskripsi rincian
     * @param amount Nominal pemasukan dalam IDR (mis. 5000000 untuk Rp 5.000.000)
     */
    function addIncome(string memory category, string memory description, uint256 amount) external {
        if (amount == 0) revert InvalidAmount();
        if (bytes(category).length == 0) revert EmptyCategory();

        userTransactions[msg.sender].push(Transaction({
            txType: uint8(TransactionType.Income),
            category: category,
            description: description,
            amount: amount,
            timestamp: block.timestamp
        }));

        totalIncome[msg.sender] += amount;

        emit TransactionAdded(
            msg.sender,
            uint8(TransactionType.Income),
            category,
            description,
            amount,
            block.timestamp
        );
    }

    /**
     * @notice Menambahkan transaksi Pengeluaran (Expense) dalam Rupiah (IDR)
     * @param category Kategori pengeluaran
     * @param description Deskripsi rincian
     * @param amount Nominal pengeluaran dalam IDR (mis. 10000 untuk Rp 10.000)
     */
    function addExpense(string memory category, string memory description, uint256 amount) external {
        if (amount == 0) revert InvalidAmount();
        if (bytes(category).length == 0) revert EmptyCategory();

        userTransactions[msg.sender].push(Transaction({
            txType: uint8(TransactionType.Expense),
            category: category,
            description: description,
            amount: amount,
            timestamp: block.timestamp
        }));

        totalExpense[msg.sender] += amount;

        emit TransactionAdded(
            msg.sender,
            uint8(TransactionType.Expense),
            category,
            description,
            amount,
            block.timestamp
        );
    }

    /**
     * @notice Membaca statistik saldo total pengguna dalam IDR (read function)
     * @param user Alamat pengguna yang ingin dicek
     * @return income Total pemasukan (IDR)
     * @return expense Total pengeluaran (IDR)
     * @return netBalance Saldo bersih dalam IDR (income - expense)
     */
    function getBalance(address user) external view returns (uint256 income, uint256 expense, int256 netBalance) {
        income = totalIncome[user];
        expense = totalExpense[user];
        netBalance = int256(income) - int256(expense);
    }

    /**
     * @notice Mendapatkan total jumlah transaksi yang dicatat oleh pengguna
     * @param user Alamat akun pengguna
     * @return Jumlah transaksi
     */
    function getTransactionCount(address user) external view returns (uint256) {
        return userTransactions[user].length;
    }

    /**
     * @notice Mendapatkan seluruh array daftar transaksi pengguna
     * @param user Alamat akun pengguna
     * @return Daftar seluruh transaksi pengguna
     */
    function getTransactions(address user) external view returns (Transaction[] memory) {
        return userTransactions[user];
    }

    /**
     * @notice Membaca detail satu transaksi berdasarkan indeks
     * @param user Alamat akun pengguna
     * @param index Indeks posisi transaksi pada array
     */
    function getTransaction(address user, uint256 index) external view returns (
        uint8 txType,
        string memory category,
        string memory description,
        uint256 amount,
        uint256 timestamp
    ) {
        if (index >= userTransactions[user].length) revert IndexOutOfBounds();
        Transaction storage txn = userTransactions[user][index];
        return (txn.txType, txn.category, txn.description, txn.amount, txn.timestamp);
    }
}
