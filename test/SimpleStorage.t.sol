// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SimpleStorage} from "../src/SimpleStorage.sol";

// Contract test sederhana yang dapat dijalankan oleh Forge
contract SimpleStorageTest {
    SimpleStorage public simpleStorage;

    event ValueChanged(address indexed setter, uint256 newValue);

    function setUp() public {
        simpleStorage = new SimpleStorage();
    }

    function test_InitialValueIsZero() public view {
        uint256 value = simpleStorage.retrieve();
        require(value == 0, "Initial value should be zero");
    }

    function test_StoreValue() public {
        simpleStorage.store(42);
        uint256 value = simpleStorage.retrieve();
        require(value == 42, "Stored value should be 42");
    }

    function test_StoreMultipleValues() public {
        simpleStorage.store(100);
        require(simpleStorage.retrieve() == 100, "Should be 100");

        simpleStorage.store(999);
        require(simpleStorage.retrieve() == 999, "Should be 999");
    }
}
