// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IAICO} from "./interfaces/IAICO.sol";
import {INonfungiblePositionManager} from "./interfaces/INonfungiblePositionManager.sol";
import {IUniswapV3Pool} from "./interfaces/IUniswapV3Pool.sol";
import {ISwapRouter} from "./interfaces/ISwapRouter.sol";
import {IProtocolRewards} from "./interfaces/IProtocolRewards.sol";
import {IWETH} from "./interfaces/IWETH.sol";
import {BondingCurve} from "./BondingCurve.sol";
import {ERC20VotesUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import {IUniswapV2Factory} from "./interfaces/IUniswapV2Factory.sol";
import {IUniswapV2Pair} from "./interfaces/IUniswapV2Pair.sol";
import {PoolCreationSubsidy} from "./PoolCreationSubsidy.sol";

/* 
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    

    AICO        AICO        AICO    
*/

error AddressZero();
error OrderTooSmall();
error DeadlineExpired();
error MaxSupplyReached();
error SlippageExceeded();
error MarketAlreadyGraduated();

contract AICO is IAICO, Initializable, ReentrancyGuardUpgradeable, OwnableUpgradeable, ERC20VotesUpgradeable, UUPSUpgradeable {
    IERC20 public constant BAG = IERC20(0x780DB7650ef1F50d949CB56400eE03052C7853CC);

    uint256 public MAX_TOTAL_SUPPLY;
    uint256 public PRIMARY_MARKET_SUPPLY;
    uint256 public SECONDARY_MARKET_SUPPLY;
    uint256 public TOTAL_FEE_BPS;
    uint256 public TOKEN_CREATOR_FEE_BPS;
    uint256 public PROTOCOL_FEE_BPS;
    uint256 public PLATFORM_REFERRER_FEE_BPS;
    uint256 public ORDER_REFERRER_FEE_BPS;
    uint256 public MIN_ORDER_SIZE;
    uint160 internal constant POOL_SQRT_PRICE_X96_WETH_0 = 400950665883918763141200546267337;
    uint160 internal constant POOL_SQRT_PRICE_X96_TOKEN_0 = 15655546353934715619853339;
    uint24 internal constant LP_FEE = 500;
    int24 internal constant LP_TICK_LOWER = -887200;
    int24 internal constant LP_TICK_UPPER = 887200;
    address public protocolFeeRecipient;
    address public protocolRewards;
    address public WETH;
    address public nonfungiblePositionManager;
    address public swapRouter;
    BondingCurve public bondingCurve;
    MarketType public marketType;
    address public platformReferrer;
    address public poolAddress;
    address public tokenCreator;
    string public tokenURI;
    uint256 public graduationFee;
    address public governanceContract;
    address payable public poolCreationSubsidy;
    address public uniswapV2Factory;
    address public agentWallet;
    uint256 public AGENT_ALLOCATION;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function _setProtocolAddresses(
        address _protocolFeeRecipient,
        address _protocolRewards,
        address _weth,
        address _poolCreationSubsidy,
        address _uniswapV2Factory
    ) internal {
        protocolFeeRecipient = _protocolFeeRecipient;
        protocolRewards = _protocolRewards;
        WETH = _weth;
        poolCreationSubsidy = payable(_poolCreationSubsidy);
        uniswapV2Factory = _uniswapV2Factory;
    }

    /// @notice Initializes a new AICO token
    /// @param _tokenCreator The address of the token creator
    /// @param _platformReferrer The address of the platform referrer
    /// @param _bondingCurve The address of the bonding curve module
    /// @param _agentWallet The address of the Agent's wallet
    /// @param _tokenURI The ERC20z token URI
    /// @param _name The token name
    /// @param _symbol The token symbol
    function initialize(
        address _tokenCreator,
        address _platformReferrer,
        address _bondingCurve,
        address _agentWallet,
        string memory _tokenURI,
        string memory _name,
        string memory _symbol,
        address _protocolFeeRecipient,
        address _protocolRewards,
        address _weth,
        address _poolCreationSubsidy,
        address _uniswapV2Factory
    ) public initializer {
        if (_tokenCreator == address(0)) revert AddressZero();
        if (_platformReferrer == address(0)) revert AddressZero();
        if (_bondingCurve == address(0)) revert AddressZero();
        if (_agentWallet == address(0)) revert AddressZero();
        if (_protocolFeeRecipient == address(0)) revert AddressZero();
        if (_protocolRewards == address(0)) revert AddressZero();
        if (_weth == address(0)) revert AddressZero();
        if (_poolCreationSubsidy == address(0)) revert AddressZero();
        if (_uniswapV2Factory == address(0)) revert AddressZero();

        __ERC20_init(_name, _symbol);
        __ERC20Votes_init();
        __Ownable_init(_tokenCreator);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        tokenCreator = _tokenCreator;
        platformReferrer = _platformReferrer;
        bondingCurve = BondingCurve(_bondingCurve);
        agentWallet = _agentWallet;
        tokenURI = _tokenURI;

        _setProtocolAddresses(
            _protocolFeeRecipient,
            _protocolRewards,
            _weth,
            _poolCreationSubsidy,
            _uniswapV2Factory
        );

        // Initialize constants as storage variables
        MAX_TOTAL_SUPPLY = 1_000_000_000e18; // 1B tokens
        PRIMARY_MARKET_SUPPLY = 500_000_000e18; // 500M tokens for bonding curve
        SECONDARY_MARKET_SUPPLY = 200_000_000e18; // 200M tokens for Uniswap
        AGENT_ALLOCATION = 300_000_000e18; // 300M tokens for Agent

        TOTAL_FEE_BPS = 100; // 1%
        TOKEN_CREATOR_FEE_BPS = 5000; // 50% (of TOTAL_FEE_BPS)
        PROTOCOL_FEE_BPS = 2500; // 25% (of TOTAL_FEE_BPS)
        PLATFORM_REFERRER_FEE_BPS = 1000; // 10% (of TOTAL_FEE_BPS)
        ORDER_REFERRER_FEE_BPS = 1500; // 15% (of TOTAL_FEE_BPS)
        MIN_ORDER_SIZE = 0.0000001e18; // Minimum order size in BAG
        graduationFee = 525e18; // Graduation fee in BAG (525 BAG)

        // Mint the Agent's allocation immediately
        _mint(agentWallet, AGENT_ALLOCATION);

        emit TokenParametersUpdated(MAX_TOTAL_SUPPLY, PRIMARY_MARKET_SUPPLY, SECONDARY_MARKET_SUPPLY);
    }

    // ... rest of the contract functions ...
} 