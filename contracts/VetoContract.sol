// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "./interfaces/IVetoContract.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VetoContract is IVetoContract, Ownable {
    mapping(bytes32 => bool) public vetoedTransactions;

    function vetoTransaction(bytes32 txHash) external override onlyOwner {
        vetoedTransactions[txHash] = true;
        emit TransactionVetoed(txHash);
    }

    function isVetoed(bytes32 txHash) external view override returns (bool) {
        return vetoedTransactions[txHash];
    }

    function updateDirector(address _newDirector) external override onlyOwner {
        address oldDirector = owner();
        _transferOwnership(_newDirector);
        emit DirectorUpdated(oldDirector, _newDirector);
    }
} 