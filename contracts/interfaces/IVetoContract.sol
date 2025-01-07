// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IVetoContract {
    event TransactionVetoed(bytes32 indexed txHash);
    event VetoRevoked(bytes32 indexed txHash);

    function vetoTransaction(bytes32 txHash) external;
    function revokeVeto(bytes32 txHash) external;
    function isVetoed(bytes32 txHash) external view returns (bool);
} 