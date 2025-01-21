// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {ERC20VotesUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";

import {BondingCurve} from "./BondingCurve.sol";
import {IProtocolRewards} from "./interfaces/IProtocolRewards.sol";
import {PoolCreationSubsidy} from "./PoolCreationSubsidy.sol";
import {IUniswapV2Factory} from "./interfaces/IUniswapV2Factory.sol";
import {IUniswapV2Router02} from "./interfaces/IUniswapV2Router02.sol";

/**
 * @title AICO
 * @notice Agent token logic
 */
contract AICO is
    Initializable,
    ReentrancyGuardUpgradeable,
    OwnableUpgradeable,
    ERC20VotesUpgradeable
{
    using SafeERC20 for IERC20;

    // -----------------------------------------------------
    // Errors
    // -----------------------------------------------------
    error AddressZero();
    error MarketAlreadyGraduated();
    error DeadlineExpired();
    error OrderTooSmall();
    error SlippageExceeded();
    error MaxSupplyReached();

    // -----------------------------------------------------
    // Enums/Events
    // -----------------------------------------------------
    enum MarketType {
        BONDING_CURVE,
        UNISWAP_POOL
    }

    event AICOMarketGraduated(
        address indexed token,
        address indexed pair,
        uint256 bagLiquidity,
        uint256 tokenLiquidity,
        uint256 lpTokens,
        MarketType marketType
    );

    event AICOTokenFees(
        address indexed tokenCreator,
        address indexed platformReferrer,
        address indexed orderReferrer,
        address protocolFeeRecipient,
        uint256 tokenCreatorFee,
        uint256 platformReferrerFee,
        uint256 orderReferrerFee,
        uint256 protocolFee
    );

    event AICOTokenBuy(
        address indexed buyer,
        address indexed recipient,
        address indexed orderReferrer,
        uint256 bagIn,
        uint256 fee,
        uint256 bagAfterFee,
        uint256 tokensBought,
        uint256 recipientBalance,
        string comment,
        uint256 totalSupply,
        MarketType marketType
    );

    event AICOTokenSell(
        address indexed seller,
        address indexed recipient,
        address indexed orderReferrer,
        uint256 bagReceived,
        uint256 fee,
        uint256 bagAfterFee,
        uint256 tokensSold,
        uint256 sellerBalance,
        string comment,
        uint256 totalSupply,
        MarketType marketType
    );

    // -----------------------------------------------------
    // State
    // -----------------------------------------------------
    uint256 public MAX_TOTAL_SUPPLY;         // 1B
    uint256 public PRIMARY_MARKET_SUPPLY;    // 500M
    uint256 public SECONDARY_MARKET_SUPPLY;  // 200M
    uint256 public AGENT_ALLOCATION;         // 300M

    // Fees
    uint256 public TOTAL_FEE_BPS; // e.g. 1% => 100
    uint256 public TOKEN_CREATOR_FEE_BPS; // e.g. 50% of fee
    uint256 public PROTOCOL_FEE_BPS;      // e.g. 25%
    uint256 public PLATFORM_REFERRER_FEE_BPS; // e.g. 10%
    uint256 public ORDER_REFERRER_FEE_BPS;    // e.g. 15%
    uint256 public MIN_ORDER_SIZE;

    // Governance references
    address public governanceContract;

    // Roles
    address public tokenCreator;
    address public platformReferrer;

    // BAG fee addresses
    address public protocolFeeRecipient;
    address public protocolRewards;
    IERC20 public BAG;

    // Market
    MarketType public marketType;
    BondingCurve public bondingCurve;

    // Graduation
    uint256 public graduationFee;
    address payable public poolCreationSubsidy;
    address public uniswapV2Factory;
    address public poolAddress;

    // Agent wallet
    address public agentWallet;

    // Optional metadata
    string public tokenURI;

    // Router
    IUniswapV2Router02 public uniswapV2Router;

    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _tokenCreator,
        address _platformReferrer,
        address _bondingCurve,
        address _agentWallet,
        address _bagToken,
        string memory _tokenURI,
        string memory _name,
        string memory _symbol,
        address _poolCreationSubsidy,
        address _uniswapV2Factory,
        address _protocolFeeRecipient,
        address _protocolRewards,
        address _owner,
        address _governanceContract
    ) external initializer {
        if (
            _tokenCreator == address(0) ||
            _platformReferrer == address(0) ||
            _bondingCurve == address(0) ||
            _agentWallet == address(0) ||
            _bagToken == address(0) ||
            _poolCreationSubsidy == address(0) ||
            _uniswapV2Factory == address(0) ||
            _protocolFeeRecipient == address(0) ||
            _protocolRewards == address(0) ||
            _owner == address(0) ||
            _governanceContract == address(0)
        ) {
            revert AddressZero();
        }

        __ERC20_init(_name, _symbol);
        __ERC20Votes_init();
        __Ownable_init(_owner);
        __ReentrancyGuard_init();

        tokenCreator = _tokenCreator;
        platformReferrer = _platformReferrer;
        bondingCurve = BondingCurve(_bondingCurve);
        agentWallet = _agentWallet;
        BAG = IERC20(_bagToken);
        tokenURI = _tokenURI;
        poolCreationSubsidy = payable(_poolCreationSubsidy);
        uniswapV2Factory = _uniswapV2Factory;
        protocolFeeRecipient = _protocolFeeRecipient;
        protocolRewards = _protocolRewards;
        governanceContract = _governanceContract;

        MAX_TOTAL_SUPPLY = 1_000_000_000e18; 
        PRIMARY_MARKET_SUPPLY = 500_000_000e18; 
        SECONDARY_MARKET_SUPPLY = 200_000_000e18; 
        AGENT_ALLOCATION = 300_000_000e18;

        // 1% total fee, distributed 50%/25%/10%/15%
        TOTAL_FEE_BPS = 100;
        TOKEN_CREATOR_FEE_BPS = 5000; // 50%
        PROTOCOL_FEE_BPS = 2500;      // 25%
        PLATFORM_REFERRER_FEE_BPS = 1000; // 10%
        ORDER_REFERRER_FEE_BPS = 1500;    // 15%
        MIN_ORDER_SIZE = 1e8; // 0.0000001 BAG
        graduationFee = 525e18; // example

        // Mint 300M to agent wallet (which is the governor in our factory)
        _mint(agentWallet, AGENT_ALLOCATION);
        marketType = MarketType.BONDING_CURVE;
    }

    // -----------------------------------------------------
    // Modifiers
    // -----------------------------------------------------
    modifier onlyGovernance() {
        require(msg.sender == owner() || msg.sender == governanceContract, "Not authorized");
        _;
    }

    // -----------------------------------------------------
    // Market mgmt
    // -----------------------------------------------------
    function setUniswapV2Router(address _router) external onlyOwner {
        if (_router == address(0)) revert AddressZero();
        uniswapV2Router = IUniswapV2Router02(_router);
    }

    // -----------------------------------------------------
    // Governance
    // -----------------------------------------------------
    function setGovernanceContract(address _gov) external onlyOwner {
        if (_gov == address(0)) revert AddressZero();
        governanceContract = _gov;
    }

    // Example upgrade for parameters
    function upgradeParameters(
        uint256 _MAX,
        uint256 _PRIMARY,
        uint256 _SECONDARY,
        uint256 _TOTAL_FEE_BPS,
        uint256 _CREATOR_FEE_BPS,
        uint256 _PROTOCOL_FEE_BPS,
        uint256 _PLATFORM_FEE_BPS,
        uint256 _ORDER_REF_FEE_BPS,
        uint256 _MIN_ORDER,
        uint256 _gradFee
    ) external onlyGovernance {
        MAX_TOTAL_SUPPLY = _MAX;
        PRIMARY_MARKET_SUPPLY = _PRIMARY;
        SECONDARY_MARKET_SUPPLY = _SECONDARY;
        TOTAL_FEE_BPS = _TOTAL_FEE_BPS;
        TOKEN_CREATOR_FEE_BPS = _CREATOR_FEE_BPS;
        PROTOCOL_FEE_BPS = _PROTOCOL_FEE_BPS;
        PLATFORM_REFERRER_FEE_BPS = _PLATFORM_FEE_BPS;
        ORDER_REFERRER_FEE_BPS = _ORDER_REF_FEE_BPS;
        MIN_ORDER_SIZE = _MIN_ORDER;
        graduationFee = _gradFee;
    }

    function updateProtocolAddresses(
        address _protocolFeeRecipient,
        address _protocolRewards,
        address _bagToken,
        address _poolCreationSubsidy,
        address _uniswapV2Factory
    ) external onlyGovernance {
        if (
            _protocolFeeRecipient == address(0) ||
            _protocolRewards == address(0) ||
            _bagToken == address(0) ||
            _poolCreationSubsidy == address(0) ||
            _uniswapV2Factory == address(0)
        ) {
            revert AddressZero();
        }

        protocolFeeRecipient = _protocolFeeRecipient;
        protocolRewards = _protocolRewards;
        BAG = IERC20(_bagToken);
        poolCreationSubsidy = payable(_poolCreationSubsidy);
        uniswapV2Factory = _uniswapV2Factory;
    }

    // -----------------------------------------------------
    // Primary Market: Bonding Curve Buy
    // -----------------------------------------------------
    function buy(
        address _recipient,
        address _orderReferrer,
        string memory _comment,
        uint256 _bagAmount,
        uint256 _minTokensOut,
        uint256 _deadline
    ) external nonReentrant returns (uint256 totalTokensBought) {
        if (block.timestamp > _deadline) revert DeadlineExpired();
        if (_recipient == address(0)) revert AddressZero();
        if (_bagAmount < MIN_ORDER_SIZE) revert OrderTooSmall();

        // 1. Transfer BAG from user => AICO, take fee
        BAG.safeTransferFrom(msg.sender, address(this), _bagAmount);
        uint256 fee = (_bagAmount * TOTAL_FEE_BPS) / 10000;
        uint256 bagAfterFee = _bagAmount - fee;
        _disperseFees(fee, _orderReferrer);

        uint256 currentSupply = totalSupply() - AGENT_ALLOCATION;

        // 2. If already graduated, buy from Uniswap
        if (marketType == MarketType.UNISWAP_POOL || currentSupply >= PRIMARY_MARKET_SUPPLY) {
            totalTokensBought = _buyFromUniswap(bagAfterFee, _recipient, _minTokensOut);
            emit AICOTokenBuy(
                msg.sender,
                _recipient,
                _orderReferrer,
                _bagAmount,
                fee,
                bagAfterFee,
                totalTokensBought,
                balanceOf(_recipient),
                _comment,
                totalSupply(),
                marketType
            );
            return totalTokensBought;
        }

        // 3. Check if we need partial fill from BondingCurve
        uint256 remainingCurveTokens = PRIMARY_MARKET_SUPPLY - currentSupply;
        uint256 fullTokensFromCurve = bondingCurve.getBAGBuyQuote(currentSupply, bagAfterFee);

        if (currentSupply + fullTokensFromCurve < PRIMARY_MARKET_SUPPLY) {
            // Normal full curve fill: we do not exceed 500M
            BAG.safeTransfer(address(bondingCurve), bagAfterFee);
            _mint(_recipient, fullTokensFromCurve);
            totalTokensBought = fullTokensFromCurve;

            // Check if we exactly matched 500M
            if (currentSupply + fullTokensFromCurve == PRIMARY_MARKET_SUPPLY) {
                _graduateToUniswap();
            }
        } else {
            // Partial fill: only fill up to 500M
            uint256 partialTokens = remainingCurveTokens;
            uint256 bagForPartial = bondingCurve.getTokenBuyQuote(currentSupply, partialTokens);

            if (bagForPartial > bagAfterFee) {
                revert SlippageExceeded();
            }

            // Transfer portion to curve
            BAG.safeTransfer(address(bondingCurve), bagForPartial);
            _mint(_recipient, partialTokens);
            totalTokensBought = partialTokens;

            // Graduate (we have exactly 500M now)
            _graduateToUniswap();

            // Buy remainder from Uniswap if user wanted more
            uint256 bagAfterCurve = bagAfterFee - bagForPartial;
            if (bagAfterCurve > 0) {
                uint256 minRemaining = (_minTokensOut > partialTokens) 
                    ? (_minTokensOut - partialTokens) 
                    : 0;

                uint256 uniswapTokens = _buyFromUniswap(
                    bagAfterCurve,
                    _recipient,
                    minRemaining
                );

                totalTokensBought += uniswapTokens;
            }
        }

        // Final slippage check
        if (totalTokensBought < _minTokensOut) {
            revert SlippageExceeded();
        }

        emit AICOTokenBuy(
            msg.sender,
            _recipient,
            _orderReferrer,
            _bagAmount,
            fee,
            bagAfterFee,
            totalTokensBought,
            balanceOf(_recipient),
            _comment,
            totalSupply(),
            marketType
        );
        return totalTokensBought;
    }

    function _buyFromUniswap(
        uint256 bagAmount,
        address recipient,
        uint256 minTokensOut
    ) internal returns (uint256 tokensBought) {
        BAG.safeIncreaseAllowance(address(uniswapV2Router), bagAmount);

        address[] memory path = new address[](2);
        path[0] = address(BAG);
        path[1] = address(this);

        uint[] memory amounts = uniswapV2Router.swapExactTokensForTokens(
            bagAmount,
            minTokensOut,
            path,
            recipient,
            block.timestamp
        );
        tokensBought = amounts[1];
    }

    // -----------------------------------------------------
    // Primary Market: Bonding Curve Sell
    // -----------------------------------------------------
    function sell(
        address _recipient,
        address _orderReferrer,
        string memory _comment,
        uint256 _tokensToSell,
        uint256 _minBagOut,
        uint256 _deadline
    ) external nonReentrant returns (uint256 bagReceived) {
        if (block.timestamp > _deadline) revert DeadlineExpired();
        if (_recipient == address(0)) revert AddressZero();
        if (_tokensToSell < MIN_ORDER_SIZE) revert OrderTooSmall();

        if (marketType == MarketType.UNISWAP_POOL) {
            revert MarketAlreadyGraduated();
        }

        // burn from user
        _burn(msg.sender, _tokensToSell);

        uint256 currentSupply = totalSupply() - AGENT_ALLOCATION;
        // how many BAG from curve
        bagReceived = bondingCurve.getTokenSellQuote(currentSupply, _tokensToSell);

        // now pull that from the curve => AICO
        // We add a function in BondingCurve to do this
        bondingCurve.withdrawBAGTo(address(this), bagReceived);

        // take fee
        uint256 fee = (bagReceived * TOTAL_FEE_BPS) / 10000;
        uint256 bagAfterFee = bagReceived - fee;
        _disperseFees(fee, _orderReferrer);

        // pay user
        BAG.safeTransfer(_recipient, bagAfterFee);

        emit AICOTokenSell(
            msg.sender,
            _recipient,
            _orderReferrer,
            bagReceived,
            fee,
            bagAfterFee,
            _tokensToSell,
            balanceOf(msg.sender),
            _comment,
            totalSupply(),
            marketType
        );
    }

    // -----------------------------------------------------
    // Graduation
    // -----------------------------------------------------
    function _graduateToUniswap() internal {
        // Switch to UNISWAP_POOL
        marketType = MarketType.UNISWAP_POOL;

        // 1) Pull all BAG from BondingCurve => AICO
        uint256 curveBag = BAG.balanceOf(address(bondingCurve));
        if (curveBag > 0) {
            bondingCurve.withdrawBAGTo(address(this), curveBag);
        }

        // 2) Deduct graduation fee from that same BAG
        if (graduationFee > 0 && BAG.balanceOf(address(this)) >= graduationFee) {
            _disperseFees(graduationFee, address(0));
        }

        // leftover after fee => used for Uniswap pool
        uint256 leftoverBAG = BAG.balanceOf(address(this));

        // 3) Mint 200M for secondary market
        _mint(address(this), SECONDARY_MARKET_SUPPLY);

        // 4) Create pool
        BAG.safeIncreaseAllowance(poolCreationSubsidy, leftoverBAG);
        _approve(address(this), poolCreationSubsidy, SECONDARY_MARKET_SUPPLY);
        address pair = PoolCreationSubsidy(poolCreationSubsidy).createPool(
            address(this),
            address(BAG)
        );
        poolAddress = pair;

        // 5) Add initial liquidity
        BAG.safeIncreaseAllowance(address(uniswapV2Router), leftoverBAG);
        _approve(address(this), address(uniswapV2Router), SECONDARY_MARKET_SUPPLY);
        uniswapV2Router.addLiquidity(
            address(BAG),
            address(this),
            leftoverBAG,
            SECONDARY_MARKET_SUPPLY,
            0, // Accept any amount of BAG
            0, // Accept any amount of AICO
            address(this), // Send LP tokens to AICO contract
            block.timestamp
        );

        emit AICOMarketGraduated(
            address(this),
            pair,
            leftoverBAG,
            SECONDARY_MARKET_SUPPLY,
            0,
            marketType
        );
    }

    // -----------------------------------------------------
    // Fee Management
    // -----------------------------------------------------
    function _disperseFees(uint256 _fee, address _orderReferrer) internal {
        if (_orderReferrer == address(0)) {
            _orderReferrer = protocolFeeRecipient;
        }

        uint256 tokenCreatorFee = (_fee * TOKEN_CREATOR_FEE_BPS) / 10000;
        uint256 platformReferrerFee = (_fee * PLATFORM_REFERRER_FEE_BPS) / 10000;
        uint256 orderReferrerFee = (_fee * ORDER_REFERRER_FEE_BPS) / 10000;
        uint256 protocolFee = (_fee * PROTOCOL_FEE_BPS) / 10000;
        uint256 totalFee = tokenCreatorFee + platformReferrerFee + orderReferrerFee + protocolFee;

        BAG.safeIncreaseAllowance(protocolRewards, totalFee);

        address[] memory recipients = new address[](4);
        uint256[] memory amounts = new uint256[](4);
        bytes4[] memory reasons = new bytes4[](4);

        recipients[0] = tokenCreator;
        amounts[0] = tokenCreatorFee;
        reasons[0] = bytes4(keccak256("AICO_CREATOR_FEE"));

        recipients[1] = platformReferrer;
        amounts[1] = platformReferrerFee;
        reasons[1] = bytes4(keccak256("AICO_PLATFORM_REFERRER_FEE"));

        recipients[2] = _orderReferrer;
        amounts[2] = orderReferrerFee;
        reasons[2] = bytes4(keccak256("AICO_ORDER_REFERRER_FEE"));

        recipients[3] = protocolFeeRecipient;
        amounts[3] = protocolFee;
        reasons[3] = bytes4(keccak256("AICO_PROTOCOL_FEE"));

        IProtocolRewards(protocolRewards).depositBatchERC20(
            address(BAG),
            recipients,
            amounts,
            reasons,
            "AICO Fees"
        );

        emit AICOTokenFees(
            tokenCreator,
            platformReferrer,
            _orderReferrer,
            protocolFeeRecipient,
            tokenCreatorFee,
            platformReferrerFee,
            orderReferrerFee,
            protocolFee
        );
    }

    // -----------------------------------------------------
    // ERC20 Overrides for Voting
    // -----------------------------------------------------
    function _update(address from, address to, uint256 amount)
        internal
        override(ERC20VotesUpgradeable)
    {
        super._update(from, to, amount);
    }

    function _maxSupply() internal view override returns (uint256) {
        return type(uint224).max;
    }
}
