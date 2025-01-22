// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {IUniswapV2Factory} from "./interfaces/IUniswapV2Factory.sol";

/// @custom:oz-upgrades-unsafe-allow constructor
contract PoolCreationSubsidy is 
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable
{
    address public uniswapV2Factory;
    mapping(address => bool) public authorizedCallers;

    event PoolCreated(address indexed token, address indexed pair);
    event CallerAuthorized(address indexed caller, bool status);
    event ETHReceived(address indexed sender, uint256 amount);

    constructor() {
        _disableInitializers();
    }

    function initialize(address _factory, address _owner) external initializer {
        __UUPSUpgradeable_init();
        __Ownable_init(_owner);
        __ReentrancyGuard_init();
        uniswapV2Factory = _factory;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function createPool(address agentToken, address bagToken)
        external
        onlyAuthorized
        nonReentrant
        returns (address pair)
    {
        if (agentToken < bagToken) {
            pair = IUniswapV2Factory(uniswapV2Factory).createPair(agentToken, bagToken);
        } else {
            pair = IUniswapV2Factory(uniswapV2Factory).createPair(bagToken, agentToken);
        }
        emit PoolCreated(agentToken, pair);
        return pair;
    }

    function setAuthorizedCaller(address caller, bool status) external onlyOwner {
        authorizedCallers[caller] = status;
        emit CallerAuthorized(caller, status);
    }

    receive() external payable {
        emit ETHReceived(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient");
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Withdraw failed");
    }

    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender], "Not authorized");
        _;
    }
}
