// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IDelayModule {
    event TransactionProposed(bytes32 indexed txHash, uint256 timestamp);
    event TransactionExecuted(bytes32 indexed txHash);
    event DelayDurationUpdated(uint256 oldDuration, uint256 newDuration);
    event VetoContractUpdated(address oldVetoContract, address newVetoContract);

    function proposeTransaction(bytes32 txHash) external;
    function executeTransaction(bytes32 txHash) external;
    function canExecute(bytes32 txHash) external view returns (bool);
    function updateDelayDuration(uint256 _newDuration) external;
    function updateVetoContract(address _newVetoContract) external;
} 