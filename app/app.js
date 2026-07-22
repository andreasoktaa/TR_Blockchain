/**
 * CATATIN DAPP APPLICATION LOGIC
 * Personal Cash Flow Tracker (Obsidian Black & Orange Theme)
 * Ethers.js v6 integration connecting to local Ethereum node (Anvil / Geth)
 * UKSW FTI - Teknologi Blockchain TR
 */

// ABI Smart Contract CashFlowTracker
const CASHFLOW_TRACKER_ABI = [
    "function addIncome(string memory category, string memory description, uint256 amount) external",
    "function addExpense(string memory category, string memory description, uint256 amount) external",
    "function getBalance(address user) external view returns (uint256 income, uint256 expense, int256 netBalance)",
    "function getTransactionCount(address user) external view returns (uint256)",
    "function getTransactions(address user) external view returns (tuple(uint8 txType, string category, string description, uint256 amount, uint256 timestamp)[])",
    "function getTransaction(address user, uint256 index) external view returns (uint8 txType, string category, string description, uint256 amount, uint256 timestamp)",
    "event TransactionAdded(address indexed user, uint8 indexed txType, string category, string description, uint256 amount, uint256 timestamp)"
];

// List Kategori Pemasukan & Pengeluaran
const CATEGORIES = {
    income: [
        "Gaji / Upah",
        "Uang Saku / Kiriman Orang Tua",
        "Freelance & Side Project",
        "Bisnis / Jualan",
        "Bonus & THR",
        "Beasiswa",
        "Bunga / Investasi / Dividen",
        "Hadiah / Pemberian",
        "Refund / Pengembalian Dana",
        "Lainnya"
    ],
    expense: [
        "Makanan & Minuman",
        "Transportasi",
        "Belanja & Kebutuhan",
        "Tagihan & Utility",
        "Hiburan & Rekreasi",
        "Pendidikan",
        "Kesehatan",
        "Lainnya"
    ]
};

// App Global State
let provider = null;
let wallet = null;
let contract = null;
let currentTxType = 'income'; // 'income' or 'expense'
let transactionsCache = [];

// DOM Elements
const rpcInput = document.getElementById('rpcEndpoint');
const contractAddressInput = document.getElementById('contractAddress');
const accountSelect = document.getElementById('accountSelect');
const customPkRow = document.getElementById('customPkRow');
const customPkInput = document.getElementById('customPrivateKey');
const btnConnect = document.getElementById('btnConnect');

const connectionDot = document.getElementById('connectionDot');
const connectionText = document.getElementById('connectionText');
const currentBlockSpan = document.getElementById('currentBlockNumber');

const statIncomeIDR = document.getElementById('statIncomeIDR');
const statIncomeRaw = document.getElementById('statIncomeRaw');
const statExpenseIDR = document.getElementById('statExpenseIDR');
const statExpenseRaw = document.getElementById('statExpenseRaw');
const statNetIDR = document.getElementById('statNetIDR');
const statTxCount = document.getElementById('statTxCount');

const txCategorySelect = document.getElementById('txCategory');
const txAmountInput = document.getElementById('txAmount');
const idrFormattedText = document.getElementById('idrFormattedText');
const btnSubmitTx = document.getElementById('btnSubmitTx');
const btnSubmitText = document.getElementById('btnSubmitText');
const btnSubmitSpinner = document.getElementById('btnSubmitSpinner');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    // Inisialisasi Kategori Pemasukan awal & warna tombol
    switchTxType('income');
    // Auto-connect to local Anvil node if available
    connectNode();
});

function setupEventListeners() {
    accountSelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            customPkRow.classList.remove('hidden');
        } else {
            customPkRow.classList.add('hidden');
        }
    });

    btnConnect.addEventListener('click', connectNode);

    txAmountInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (val && !isNaN(val) && parseInt(val) > 0) {
            idrFormattedText.innerText = formatRupiah(val);
        } else {
            idrFormattedText.innerText = 'Rp 0';
        }
    });
}

// Connect to Ethereum Node & Bind Wallet/Contract
async function connectNode() {
    const rpcUrl = rpcInput.value.trim();
    if (!rpcUrl) {
        showToast('RPC Endpoint tidak boleh kosong!', 'error');
        return;
    }

    try {
        connectionText.innerText = 'Menghubungkan...';
        connectionDot.className = 'dot-status';

        // Inisialisasi Ethers JsonRpcProvider
        provider = new ethers.JsonRpcProvider(rpcUrl);

        // Test RPC connection dengan getBlockNumber
        const blockNumber = await provider.getBlockNumber();
        currentBlockSpan.innerText = `#${blockNumber}`;

        // Get Selected Private Key
        let pk = accountSelect.value;
        if (pk === 'custom') {
            pk = customPkInput.value.trim();
            if (!pk.startsWith('0x')) pk = '0x' + pk;
        }

        if (!pk || pk.length < 60) {
            showToast('Private key tidak valid!', 'error');
            connectionText.innerText = 'Gagal (Private Key)';
            connectionDot.className = 'dot-status disconnected';
            return;
        }

        // Bind Wallet ke Provider
        wallet = new ethers.Wallet(pk, provider);
        const userAddress = await wallet.getAddress();

        connectionText.innerText = `Terhubung: ${shortenAddress(userAddress)}`;
        connectionDot.className = 'dot-status connected';

        showToast(`Terhubung ke Node (${shortenAddress(userAddress)})`, 'success');

        // Check if contract address is set
        const cAddress = contractAddressInput.value.trim();
        if (cAddress && ethers.isAddress(cAddress)) {
            await bindContract(cAddress);
        } else {
            showToast('Masukkan alamat Smart Contract hasil deploy untuk mulai', 'error');
        }
    } catch (error) {
        console.error('Connection Error:', error);
        connectionText.innerText = 'Gagal Terhubung';
        connectionDot.className = 'dot-status disconnected';
        showToast('Gagal terhubung ke RPC Node: ' + error.message, 'error');
    }
}

// Bind Smart Contract Instance with Code Verification
async function bindContract(contractAddress) {
    if (!wallet) {
        showToast('Silakan hubungkan node terlebih dahulu!', 'error');
        return false;
    }

    try {
        // Diagnostic check: Verify if bytecode exists at this address
        const code = await provider.getCode(contractAddress);
        if (!code || code === '0x') {
            showToast('Alamat kontrak tidak ditemukan di Node Anvil ini! (Anvil mungkin baru di-restart). Silakan deploy ulang kontrak CashFlowTracker.sol.', 'error');
            return false;
        }

        contract = new ethers.Contract(contractAddress, CASHFLOW_TRACKER_ABI, wallet);
        await fetchTransactions();
        return true;
    } catch (err) {
        console.error('Contract Binding Error:', err);
        showToast('Gagal binding kontrak: ' + err.message, 'error');
        return false;
    }
}

// Switch Tab Transaction Type & Update Dynamic Categories
function switchTxType(type) {
    currentTxType = type;
    const tabIncome = document.getElementById('tabIncome');
    const tabExpense = document.getElementById('tabExpense');

    // Update Dropdown Kategori secara Dinamis
    txCategorySelect.innerHTML = '';
    const categoryList = CATEGORIES[type] || [];
    categoryList.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.innerText = cat;
        txCategorySelect.appendChild(option);
    });

    if (type === 'income') {
        tabIncome.classList.add('active');
        tabExpense.classList.remove('active');
        btnSubmitTx.className = 'btn btn-submit income-btn';
        btnSubmitText.innerText = 'Kirim Transaksi Pemasukan';
    } else {
        tabExpense.classList.add('active');
        tabIncome.classList.remove('active');
        btnSubmitTx.className = 'btn btn-submit expense-btn';
        btnSubmitText.innerText = 'Kirim Transaksi Pengeluaran';
    }
}

// Submit Transaction to Blockchain (Write Call in IDR)
async function handleFormSubmit(event) {
    event.preventDefault();

    const cAddress = contractAddressInput.value.trim();
    if (!cAddress || !ethers.isAddress(cAddress)) {
        showToast('Alamat Smart Contract belum diisi atau tidak valid!', 'error');
        return;
    }

    if (!contract || contract.target !== cAddress) {
        const bound = await bindContract(cAddress);
        if (!bound) return;
    }

    const category = txCategorySelect.value;
    const amountIdr = document.getElementById('txAmount').value;
    const description = document.getElementById('txDescription').value.trim();

    if (!amountIdr || parseInt(amountIdr) <= 0) {
        showToast('Nominal transaksi IDR harus lebih dari 0!', 'error');
        return;
    }

    if (!description) {
        showToast('Rincian deskripsi wajib diisi!', 'error');
        return;
    }

    const amountInt = BigInt(amountIdr);

    try {
        setSubmitLoading(true);

        let tx;
        if (currentTxType === 'income') {
            tx = await contract.addIncome(category, description, amountInt);
        } else {
            tx = await contract.addExpense(category, description, amountInt);
        }

        showToast(`Transaksi dikirim! Hash: ${shortenAddress(tx.hash)}`, 'success');

        // Wait for mining/inclusion in block
        const receipt = await tx.wait();
        showToast(`Berhasil masuk Blok #${receipt.blockNumber}! Gas Used: ${receipt.gasUsed.toString()}`, 'success');

        // Reset Form
        document.getElementById('txAmount').value = '';
        document.getElementById('txDescription').value = '';
        idrFormattedText.innerText = 'Rp 0';

        // Refresh Data
        await fetchTransactions();
    } catch (error) {
        console.error('Submit Tx Error:', error);
        showToast('Gagal mengirim transaksi: ' + (error.reason || error.message), 'error');
    } finally {
        setSubmitLoading(false);
    }
}

// Read Balance & Transaction History from Smart Contract (Read Call in IDR)
async function fetchTransactions() {
    const cAddress = contractAddressInput.value.trim();
    if (!cAddress || !ethers.isAddress(cAddress)) {
        return;
    }

    if (!contract || contract.target !== cAddress) {
        const bound = await bindContract(cAddress);
        if (!bound) return;
    }

    try {
        const userAddress = await wallet.getAddress();

        // Diagnostic code check
        const code = await provider.getCode(cAddress);
        if (!code || code === '0x') {
            showToast('Tidak ada kode kontrak di alamat ini. (Apakah Anvil baru di-restart?) Deploy ulang kontrak di WSL.', 'error');
            return;
        }

        // 1. Query Balance (Read Call)
        const [incomeRaw, expenseRaw, netBalanceRaw] = await contract.getBalance(userAddress);
        
        statIncomeIDR.innerText = formatRupiah(incomeRaw);
        statIncomeRaw.innerText = `${incomeRaw.toString()} IDR`;

        statExpenseIDR.innerText = formatRupiah(expenseRaw);
        statExpenseRaw.innerText = `${expenseRaw.toString()} IDR`;

        statNetIDR.innerText = formatRupiah(netBalanceRaw);
        if (netBalanceRaw < 0n) {
            statNetIDR.style.color = 'var(--expense-red)';
        } else {
            statNetIDR.style.color = 'var(--primary)';
        }

        // 2. Query Transactions (Read Call)
        const rawTxs = await contract.getTransactions(userAddress);
        statTxCount.innerText = `${rawTxs.length} Transaksi Tercatat`;

        // Format transactions array
        transactionsCache = rawTxs.map((tx, idx) => ({
            index: idx + 1,
            txType: Number(tx.txType), // 0: Income, 1: Expense
            category: tx.category,
            description: tx.description,
            amountIDR: tx.amount,
            timestamp: Number(tx.timestamp)
        }));

        // Render Table
        renderTable(transactionsCache);

        // Update Block Number
        const currentBlock = await provider.getBlockNumber();
        currentBlockSpan.innerText = `#${currentBlock}`;
    } catch (error) {
        console.error('Fetch Error:', error);
        if (error.code === 'BAD_DATA' || error.message.includes('could not decode')) {
            showToast('Gagal membaca data dari kontrak. Alamat tersebut bukan kontrak CashFlowTracker atau Anvil baru di-restart.', 'error');
        } else {
            showToast('Gagal membaca data dari kontrak: ' + error.message, 'error');
        }
    }
}

// Render Table Rows (Iconless clean design)
function renderTable(data) {
    const tbody = document.getElementById('txTableBody');
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center empty-state">
                    Belum ada transaksi tercatat untuk akun ini.
                </td>
            </tr>
        `;
        return;
    }

    // Render in reverse order (newest on top)
    const reversedData = [...data].reverse();

    reversedData.forEach((tx) => {
        const tr = document.createElement('tr');

        const isIncome = tx.txType === 0;
        const typeBadge = isIncome
            ? `<span class="badge-income">Income</span>`
            : `<span class="badge-expense">Expense</span>`;

        const formattedDate = tx.timestamp > 0 
            ? new Date(tx.timestamp * 1000).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
            : 'Pending Block';

        tr.innerHTML = `
            <td class="font-mono">${tx.index}</td>
            <td>${typeBadge}</td>
            <td><strong>${escapeHtml(tx.category)}</strong></td>
            <td>${escapeHtml(tx.description)}</td>
            <td class="font-mono" style="font-weight: 700; color: ${isIncome ? 'var(--income-green)' : 'var(--expense-red)'}">
                ${isIncome ? '+' : '-'}${formatRupiah(tx.amountIDR)}
            </td>
            <td class="font-mono" style="font-size: 12px; color: var(--text-muted)">${formattedDate}</td>
        `;

        tbody.appendChild(tr);
    });
}

// Filter Table Logic
function filterTable() {
    const searchTerm = document.getElementById('searchFilter').value.toLowerCase();
    const selectedType = document.getElementById('typeFilter').value;

    const filtered = transactionsCache.filter(tx => {
        const matchesSearch = tx.category.toLowerCase().includes(searchTerm) || 
                              tx.description.toLowerCase().includes(searchTerm);
        const matchesType = selectedType === 'all' || tx.txType.toString() === selectedType;
        return matchesSearch && matchesType;
    });

    renderTable(filtered);
}

// Utility Functions
function setSubmitLoading(isLoading) {
    if (isLoading) {
        btnSubmitTx.disabled = true;
        btnSubmitText.classList.add('hidden');
        btnSubmitSpinner.classList.remove('hidden');
    } else {
        btnSubmitTx.disabled = false;
        btnSubmitText.classList.remove('hidden');
        btnSubmitSpinner.classList.add('hidden');
    }
}

function shortenAddress(addr) {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
}

function formatRupiah(val) {
    let num = typeof val === 'bigint' ? val : BigInt(val || 0);
    const isNegative = num < 0n;
    if (isNegative) num = -num;

    const formatted = num.toLocaleString('id-ID');
    return (isNegative ? '-Rp ' : 'Rp ') + formatted;
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    toast.innerHTML = `
        <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 5500);
}
