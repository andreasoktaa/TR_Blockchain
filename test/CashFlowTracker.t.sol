// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {CashFlowTracker} from "../src/CashFlowTracker.sol";

contract CashFlowTrackerTest {
    CashFlowTracker public tracker;

    event TransactionAdded(
        address indexed user,
        uint8 indexed txType,
        string category,
        string description,
        uint256 amount,
        uint256 timestamp
    );

    function setUp() public {
        tracker = new CashFlowTracker();
    }

    function test_InitialBalanceIsZero() public view {
        (uint256 income, uint256 expense, int256 netBalance) = tracker.getBalance(address(this));
        require(income == 0, "Income should be 0");
        require(expense == 0, "Expense should be 0");
        require(netBalance == 0, "Net balance should be 0");
        require(tracker.getTransactionCount(address(this)) == 0, "Count should be 0");
    }

    function test_AddIncomeIDR() public {
        // Tambah Gaji Rp 5.000.000
        tracker.addIncome("Gaji", "Gaji Bulanan", 5000000);

        (uint256 income, uint256 expense, int256 netBalance) = tracker.getBalance(address(this));
        require(income == 5000000, "Income IDR mismatch");
        require(expense == 0, "Expense should remain 0");
        require(netBalance == 5000000, "Net balance IDR mismatch");
        require(tracker.getTransactionCount(address(this)) == 1, "Count mismatch");

        (uint8 txType, string memory category, string memory description, uint256 amount,) = tracker.getTransaction(address(this), 0);
        require(txType == 0, "Type should be 0 (Income)");
        require(keccak256(bytes(category)) == keccak256(bytes("Gaji")), "Category mismatch");
        require(keccak256(bytes(description)) == keccak256(bytes("Gaji Bulanan")), "Description mismatch");
        require(amount == 5000000, "Amount IDR mismatch");
    }

    function test_AddExpenseIDR() public {
        // Tambah Pengeluaran Makan Rp 10.000 dan Transport Rp 5.000
        tracker.addExpense("Makanan", "Makan Siang Nasi Goreng", 10000);
        tracker.addExpense("Transportasi", "Ongkos Angkot", 5000);

        (uint256 income, uint256 expense, int256 netBalance) = tracker.getBalance(address(this));
        require(income == 0, "Income should be 0");
        require(expense == 15000, "Total Expense should be Rp 15.000");
        require(netBalance == -15000, "Net balance should be -15.000");
        require(tracker.getTransactionCount(address(this)) == 2, "Count should be 2");
    }

    function test_MultipleTransactionsNetBalanceIDR() public {
        tracker.addIncome("Gaji", "Gaji Bulanan", 3000000);
        tracker.addExpense("Makanan", "Makan Malam", 10000);
        tracker.addExpense("Transportasi", "Bensin", 5000);

        (uint256 income, uint256 expense, int256 netBalance) = tracker.getBalance(address(this));
        require(income == 3000000, "Total income check failed");
        require(expense == 15000, "Total expense check failed");
        require(netBalance == 2985000, "Net balance check failed (3.000.000 - 15.000 = 2.985.000)");
        require(tracker.getTransactionCount(address(this)) == 3, "Total tx count failed");
    }
}
