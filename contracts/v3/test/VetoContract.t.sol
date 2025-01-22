// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../contracts/VetoContract.sol";

contract VetoContractTest is Test {
    VetoContract public vetoContract;
    address public owner;
    address public user;

    function setUp() public {
        owner = address(this);
        user = address(0x1);
        vetoContract = new VetoContract();
    }

    function testVeto() public {
        bytes32 txHash = keccak256("transaction");
        vm.expectEmit(true, false, false, true);
        emit TransactionVetoed(txHash);
        vetoContract.vetoTransaction(txHash);
        assertTrue(vetoContract.isVetoed(txHash));
    }

    function testCannotVetoIfNotOwner() public {
        bytes32 txHash = keccak256("transaction");
        vm.prank(user);
        vm.expectRevert("Ownable: caller is not the owner");
        vetoContract.vetoTransaction(txHash);
    }

    function testUpdateDirector() public {
        address newDirector = address(0x2);
        vm.expectEmit(true, true, false, true);
        emit DirectorUpdated(owner, newDirector);
        vetoContract.updateDirector(newDirector);
        assertEq(vetoContract.owner(), newDirector);
    }
} 