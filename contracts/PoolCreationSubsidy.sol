// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {IUniswapV2Factory} from "./interfaces/IUniswapV2Factory.sol";

contract PoolCreationSubsidy is OwnableUpgradeable, ReentrancyGuardUpgradeable {
    address public uniswapV2Factory;
    mapping(address => bool) public authorizedCallers;

    event PoolCreated(address indexed token, address indexed pair);
    event CallerAuthorized(address indexed caller, bool status);
    event ETHReceived(address indexed sender, uint256 amount);

    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender], "Not authorized");
        _;
    }

    constructor() {
        _disableInitializers();
    }

    function initialize(address _uniswapV2Factory, address _owner) external initializer {
        __Ownable_init(_owner);
        __ReentrancyGuard_init();
        uniswapV2Factory = _uniswapV2Factory;
    }

    function createPool(address token, address weth) external onlyAuthorized nonReentrant returns (address pair) {
        // Sort token addresses (required by Uniswap V2)
        (address token0, address token1) = token < weth ? (token, weth) : (weth, token);
        
        // Create the pair using protocol's ETH
        pair = IUniswapV2Factory(uniswapV2Factory).createPair(token0, token1);
        
        emit PoolCreated(token, pair);
        return pair;
    }

    function setAuthorizedCaller(address caller, bool status) external onlyOwner {
        authorizedCallers[caller] = status;
        emit CallerAuthorized(caller, status);
    }

    // Function to receive ETH
    receive() external payable {
        emit ETHReceived(msg.sender, msg.value);
    }

    // Emergency withdrawal function
    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Transfer failed");
    }
} 