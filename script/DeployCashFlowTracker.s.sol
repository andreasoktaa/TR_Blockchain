// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {CashFlowTracker} from "../src/CashFlowTracker.sol";

/**
 * @title DeployCashFlowTracker
 * @dev Script deployment Forge untuk men-deploy CashFlowTracker ke Anvil / Geth local net
 */
contract DeployCashFlowTracker {
    function run() external returns (CashFlowTracker) {
        // Inisialisasi kontrak baru
        CashFlowTracker tracker = new CashFlowTracker();
        return tracker;
    }
}
