// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SimpleStorage
 * @dev Kontrak dasar latihan Langkah 4 Tugas Rancang Teknologi Blockchain UKSW
 */
contract SimpleStorage {
    uint256 private value;

    event ValueChanged(address indexed setter, uint256 newValue);

    /**
     * @dev Menyimpan nilai uint256 baru ke storage dan memancarkan event ValueChanged
     * @param _value Nilai uint256 yang ingin disimpan
     */
    function store(uint256 _value) public {
        value = _value;
        emit ValueChanged(msg.sender, _value);
    }

    /**
     * @dev Membaca nilai uint256 yang tersimpan pada storage
     * @return Nilai uint256 yang tersimpan
     */
    function retrieve() public view returns (uint256) {
        return value;
    }
}
