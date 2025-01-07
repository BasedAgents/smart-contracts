// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IVetoContract} from "./interfaces/IVetoContract.sol";

/* 
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    

    AICO        AICO        AICO    
*/
contract DelayModule is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    IVetoContract public vetoContract;
    uint256 public delayDuration; // Delay in seconds
    mapping(bytes32 => uint256) public proposedAt; // Tracks when transactions were proposed
    mapping(bytes32 => bool) public isExecuted; // Tracks executed transactions

    event TransactionProposed(bytes32 indexed txHash, uint256 timestamp);
    event TransactionExecuted(bytes32 indexed txHash);
    event DelayDurationUpdated(uint256 oldDuration, uint256 newDuration);
    event VetoContractUpdated(address oldVetoContract, address newVetoContract);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _vetoContract,
        uint256 _delayDuration,
        address _owner
    ) external initializer {
        __Ownable_init(_owner);
        __UUPSUpgradeable_init();
        
        vetoContract = IVetoContract(_vetoContract);
        delayDuration = _delayDuration;
    }

    function proposeTransaction(bytes32 txHash) external {
        require(proposedAt[txHash] == 0, "DelayModule: Transaction already proposed");
        require(!isExecuted[txHash], "DelayModule: Transaction already executed");
        
        proposedAt[txHash] = block.timestamp;
        emit TransactionProposed(txHash, block.timestamp);
    }

    function canExecute(bytes32 txHash) public view returns (bool) {
        if (proposedAt[txHash] == 0) return false;
        if (isExecuted[txHash]) return false;
        if (block.timestamp < proposedAt[txHash] + delayDuration) return false;
        if (vetoContract.isVetoed(txHash)) return false;
        return true;
    }

    function executeTransaction(bytes32 txHash) external {
        require(canExecute(txHash), "DelayModule: Transaction cannot be executed");

        isExecuted[txHash] = true;
        emit TransactionExecuted(txHash);
    }

    function updateDelayDuration(uint256 _newDuration) external onlyOwner {
        uint256 oldDuration = delayDuration;
        delayDuration = _newDuration;
        emit DelayDurationUpdated(oldDuration, _newDuration);
    }

    function updateVetoContract(address _newVetoContract) external onlyOwner {
        address oldVetoContract = address(vetoContract);
        vetoContract = IVetoContract(_newVetoContract);
        emit VetoContractUpdated(oldVetoContract, _newVetoContract);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
} 