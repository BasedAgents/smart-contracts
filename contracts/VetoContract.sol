// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/* 
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    

    AICO        AICO        AICO    
*/
contract VetoContract is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    mapping(bytes32 => bool) public vetoedTransactions;
    
    event TransactionVetoed(bytes32 indexed txHash);
    event VetoRevoked(bytes32 indexed txHash);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _owner) external initializer {
        __Ownable_init(_owner);
        __UUPSUpgradeable_init();
    }

    function vetoTransaction(bytes32 txHash) external onlyOwner {
        vetoedTransactions[txHash] = true;
        emit TransactionVetoed(txHash);
    }

    function revokeVeto(bytes32 txHash) external onlyOwner {
        vetoedTransactions[txHash] = false;
        emit VetoRevoked(txHash);
    }

    function isVetoed(bytes32 txHash) external view returns (bool) {
        return vetoedTransactions[txHash];
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
} 