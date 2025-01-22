// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./AgentERC20VotesImplementation.sol";
import "./PlatformHook.sol";

interface IPoolManager {
    function initializePool(bytes calldata poolKey, uint160 initialPrice) external;
}

struct PoolKey {
    address currency0;
    address currency1;
    uint24 fee;
    int24 tickSpacing;
    address hooks;
}

contract AgentFactory is Ownable {
    using Clones for address;

    // references
    address public immutable agentERC20Implementation;
    address public platformHook;
    IPoolManager public poolManager;

    // optional BAG usage
    address public bagToken;
    uint256 public minBagRequired = 1000e18;

    event AgentCreated(address indexed agentToken, address indexed agentWallet, bytes32 poolId);

    constructor(
        address _agentImplementation,
        address _governanceMultisig,
        address _platformHook,
        address _poolManager,
        address _bagToken
    ) {
        require(_agentImplementation != address(0), "Zero agentImpl");
        require(_governanceMultisig != address(0), "Zero governance");
        require(_platformHook != address(0), "Zero hook");
        require(_poolManager != address(0), "Zero poolManager");
        agentERC20Implementation = _agentImplementation;
        platformHook = _platformHook;
        poolManager = IPoolManager(_poolManager);
        bagToken = _bagToken;

        _transferOwnership(_governanceMultisig);
    }

    function setMinBagRequired(uint256 newMin) external onlyOwner {
        minBagRequired = newMin;
    }

    function setBagToken(address newBag) external onlyOwner {
        bagToken = newBag;
    }

    function setPlatformHook(address newHook) external onlyOwner {
        platformHook = newHook;
    }

    function setPoolManager(address newManager) external onlyOwner {
        poolManager = IPoolManager(newManager);
    }

    /**
     * @notice createAgent
     * @param name    ERC20 name
     * @param symbol  ERC20 symbol
     * @param agentWallet  The controlling wallet (EOA or Gnosis Safe)
     * @param platformReferrer  optional address for the platform
     * @param agentMint         tokens minted to user
     * @param poolMint          tokens minted to the factory (for liquidity or else)
     * @param bagDeposit        user’s BAG deposit (if needed)
     * @param tokenURI          optional metadata
     * @param key               (currency0, currency1, fee, tickSpacing, hooks=platformHook)
     * @param initialSqrtPrice  initial price Q96
     */
    function createAgent(
        string calldata name,
        string calldata symbol,
        address agentWallet,
        address platformReferrer,
        uint256 agentMint,
        uint256 poolMint,
        uint256 bagDeposit,
        string calldata tokenURI,
        PoolKey calldata key,
        uint160 initialSqrtPrice
    ) external returns (address agentToken, bytes32 poolId) {
        require(bagDeposit >= minBagRequired, "BAG deposit too low");
        require(agentWallet != address(0), "Zero agentWallet");

        // 1. clone agent token
        agentToken = agentERC20Implementation.clone();

        // 2. initialize
        AgentERC20VotesImplementation(agentToken).initialize(
            name,
            symbol,
            agentWallet,
            tokenURI
        );

        // 3. mint
        AgentERC20VotesImplementation(agentToken).mint(msg.sender, agentMint);
        AgentERC20VotesImplementation(agentToken).mint(address(this), poolMint);

        // 4. encode the PoolKey for v4
        bytes memory encodedKey = abi.encode(
            key.currency0,
            key.currency1,
            key.fee,
            key.tickSpacing,
            key.hooks
        );
        // 5. initialize
        poolManager.initializePool(encodedKey, initialSqrtPrice);

        // 6. poolId = keccak256 of the encodedKey
        poolId = keccak256(encodedKey);

        // 7. register in platformHook
        PlatformHook(platformHook).registerPool(poolId, agentWallet, platformReferrer);

        emit AgentCreated(agentToken, agentWallet, poolId);

        return (agentToken, poolId);
    }
}
