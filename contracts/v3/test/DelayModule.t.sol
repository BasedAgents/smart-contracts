// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../contracts/DelayModule.sol";
import "../contracts/VetoContract.sol";

contract DelayModuleTest is Test {
    DelayModule public delayModule;
    VetoContract public vetoContract;
    address public owner;
    address public user;
    uint256 public constant DELAY = 1 days;

    function setUp() public {
        owner = address(this);
        user = address(0x1);
        
        vetoContract = new VetoContract();
        delayModule = new DelayModule(address(vetoContract), DELAY);
    }

    function testPropose() public {
        bytes32 txHash = keccak256("transaction");
        vm.expectEmit(true, false, false, true);
        emit TransactionProposed(txHash, block.timestamp);
        delayModule.proposeTransaction(txHash);
    }

    function testCannotProposeAgain() public {
        bytes32 txHash = keccak256("transaction");
        delayModule.proposeTransaction(txHash);
        
        vm.expectRevert("Transaction already proposed");
        delayModule.proposeTransaction(txHash);
    }

    function testCanExecute() public {
        bytes32 txHash = keccak256("transaction");
        delayModule.proposeTransaction(txHash);
        
        // Should not be executable before delay
        assertFalse(delayModule.canExecute(txHash));
        
        // Should be executable after delay
        vm.warp(block.timestamp + DELAY);
        assertTrue(delayModule.canExecute(txHash));
    }

    function testCannotExecuteIfVetoed() public {
        bytes32 txHash = keccak256("transaction");
        delayModule.proposeTransaction(txHash);
        
        vm.warp(block.timestamp + DELAY);
        vetoContract.vetoTransaction(txHash);
        
        assertFalse(delayModule.canExecute(txHash));
    }

    function testUpdateDelayDuration() public {
        uint256 newDelay = 2 days;
        vm.expectEmit(false, false, false, true);
        emit DelayDurationUpdated(DELAY, newDelay);
        delayModule.updateDelayDuration(newDelay);
        assertEq(delayModule.delayDuration(), newDelay);
    }
} 