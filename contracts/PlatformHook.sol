// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

// Minimal placeholders for Uniswap v4 structures

struct PoolKey {
    address currency0;
    address currency1;
    uint24 fee;
    int24 tickSpacing;
    address hooks;
}

interface IPoolManager {
    struct SwapParams {
        bool zeroForOne;
        int256 amountSpecified;
        uint160 sqrtPriceLimitX96;
    }
}

struct PoolConfig {
    address owner;          // The agent's wallet or controlling entity
    address agentExtension; // optional sub-hook
    address platformReferrer; 
}

contract PlatformHook is Ownable {
    mapping(bytes32 => PoolConfig) public poolConfig;

    // example fees
    uint16 public totalFeeBps = 100;     // 1%
    uint16 public agentBps     = 5000;   // 50% of that fee
    uint16 public protocolBps  = 2500;   // 25%
    uint16 public platformBps  = 1000;   // 10%
    uint16 public orderRefBps  = 1500;   // 15%

    address public protocolAddr;
    address public platformAddr;

    event PoolRegistered(bytes32 indexed poolId, address indexed owner, address referrer);
    event FeeSplitsUpdated(uint16 totalFee, uint16 agent, uint16 protocol, uint16 platform, uint16 orderRef);

    constructor(
        address _governanceMultisig,
        address _protocol,
        address _platform
    ) {
        require(_governanceMultisig != address(0), "Zero gov");
        require(_protocol != address(0), "Zero protocol");
        require(_platform != address(0), "Zero platform");
        _transferOwnership(_governanceMultisig);

        protocolAddr = _protocol;
        platformAddr = _platform;
    }

    function registerPool(bytes32 poolId, address agentWallet, address referrer) external {
        require(poolConfig[poolId].owner == address(0), "Already set");
        poolConfig[poolId] = PoolConfig({
            owner: agentWallet,
            agentExtension: address(0),
            platformReferrer: referrer
        });
        emit PoolRegistered(poolId, agentWallet, referrer);
    }

    function setAgentExtension(bytes32 pid, address newExt) external {
        require(msg.sender == poolConfig[pid].owner, "Not owner");
        poolConfig[pid].agentExtension = newExt;
    }

    function setFeeSplits(
        uint16 _totalFeeBps,
        uint16 _agentBps,
        uint16 _protocolBps,
        uint16 _platformBps,
        uint16 _orderRefBps
    ) external onlyOwner {
        require(_agentBps + _protocolBps + _platformBps + _orderRefBps == 10000, "Invalid splits");
        totalFeeBps = _totalFeeBps;
        agentBps = _agentBps;
        protocolBps = _protocolBps;
        platformBps = _platformBps;
        orderRefBps = _orderRefBps;
        emit FeeSplitsUpdated(_totalFeeBps, _agentBps, _protocolBps, _platformBps, _orderRefBps);
    }

    // Example stub for beforeSwap
    // In real usage, you'd do fee logic, agent extension calls, etc.
    function beforeSwap(
        address sender,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        bytes calldata userData
    ) external /*returns (bytes4)*/ {
        // fee logic here
    }
}
