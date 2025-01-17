// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IDelayModule.sol";
import "./interfaces/IVetoContract.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DelayModule is IDelayModule, Ownable {
    IVetoContract public vetoContract;
    uint256 public delayDuration;
    mapping(bytes32 => uint256) public proposedAt;

    constructor(address _vetoContract, uint256 _delayDuration) Ownable(msg.sender){
        vetoContract = IVetoContract(_vetoContract);
        delayDuration = _delayDuration;
    }

    function proposeTransaction(bytes32 txHash) external override {
        require(proposedAt[txHash] == 0, "Transaction already proposed");
        proposedAt[txHash] = block.timestamp;
        emit TransactionProposed(txHash, block.timestamp);
    }

    function executeTransaction(bytes32 txHash) external override {
        require(canExecute(txHash), "Cannot execute");
        delete proposedAt[txHash];
        emit TransactionExecuted(txHash);
        // Actual execution logic would be implemented by inheriting contracts
    }

    function canExecute(bytes32 txHash) public view override returns (bool) {
        if (proposedAt[txHash] == 0) return false;
        if (block.timestamp < proposedAt[txHash] + delayDuration) return false;
        if (vetoContract.isVetoed(txHash)) return false;
        return true;
    }

    function updateDelayDuration(uint256 _newDuration) external override onlyOwner {
        uint256 oldDuration = delayDuration;
        delayDuration = _newDuration;
        emit DelayDurationUpdated(oldDuration, _newDuration);
    }

    function updateVetoContract(address _newVetoContract) external override onlyOwner {
        address oldVetoContract = address(vetoContract);
        vetoContract = IVetoContract(_newVetoContract);
        emit VetoContractUpdated(oldVetoContract, _newVetoContract);
    }
} 