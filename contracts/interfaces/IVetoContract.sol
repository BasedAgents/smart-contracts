// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IVetoContract {
    event DirectorUpdated(address indexed oldDirector, address indexed newDirector);
    event TransactionVetoed(bytes32 indexed txHash);

    function vetoTransaction(bytes32 txHash) external;
    function isVetoed(bytes32 txHash) external view returns (bool);
    function updateDirector(address _newDirector) external;
} 