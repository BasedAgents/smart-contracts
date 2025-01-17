// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {IAICO} from "./interfaces/IAICO.sol";
import {INonfungiblePositionManager} from "./interfaces/INonfungiblePositionManager.sol";
import {IUniswapV3Pool} from "./interfaces/IUniswapV3Pool.sol";
import {ISwapRouter} from "./interfaces/ISwapRouter.sol";
import {IProtocolRewards} from "./interfaces/IProtocolRewards.sol";
import {IWETH} from "./interfaces/IWETH.sol";
import {BondingCurve} from "./BondingCurve.sol";
import {ERC20VotesUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import {IVotesUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/utils/IVotesUpgradeable.sol";
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
contract AICO is IAICO, Initializable, ReentrancyGuardUpgradeable, OwnableUpgradeable, ERC20VotesUpgradeable {
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
    address public poolCreationSubsidy;
    address public uniswapV2Factory;
    address public agentWallet;
    uint256 public AGENT_ALLOCATION;

    constructor(
        address _protocolFeeRecipient,
        address _protocolRewards,
        address _weth,
        address _poolCreationSubsidy,
        address _uniswapV2Factory
    ) initializer {
        if (_protocolFeeRecipient == address(0)) revert AddressZero();
        if (_protocolRewards == address(0)) revert AddressZero();
        if (_weth == address(0)) revert AddressZero();
        if (_poolCreationSubsidy == address(0)) revert AddressZero();
        if (_uniswapV2Factory == address(0)) revert AddressZero();

        _setProtocolAddresses(
            _protocolFeeRecipient,
            _protocolRewards,
            _weth,
            _poolCreationSubsidy,
            _uniswapV2Factory
        );
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
        string memory _symbol
    ) public payable initializer {
        if (_tokenCreator == address(0)) revert AddressZero();
        if (_platformReferrer == address(0)) revert AddressZero();
        if (_bondingCurve == address(0)) revert AddressZero();
        if (_agentWallet == address(0)) revert AddressZero();

        __ERC20_init(_name, _symbol);
        __ERC20Votes_init();
        __Ownable_init(_tokenCreator);
        __ReentrancyGuard_init();

        tokenCreator = _tokenCreator;
        platformReferrer = _platformReferrer;
        bondingCurve = BondingCurve(_bondingCurve);
        agentWallet = _agentWallet;
        tokenURI = _tokenURI;

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

    // ... rest of the contract functions with renamed references ...

    /// @dev Handles calculating and depositing fees to an escrow protocol rewards contract
    function _disperseFees(uint256 _fee, address _orderReferrer) internal {
        if (_orderReferrer == address(0)) {
            _orderReferrer = protocolFeeRecipient;
        }

        uint256 tokenCreatorFee = _calculateFee(_fee, TOKEN_CREATOR_FEE_BPS);
        uint256 platformReferrerFee = _calculateFee(_fee, PLATFORM_REFERRER_FEE_BPS);
        uint256 orderReferrerFee = _calculateFee(_fee, ORDER_REFERRER_FEE_BPS);
        uint256 protocolFee = _calculateFee(_fee, PROTOCOL_FEE_BPS);
        uint256 totalFee = tokenCreatorFee + platformReferrerFee + orderReferrerFee + protocolFee;

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

        IProtocolRewards(protocolRewards).depositBatch{value: totalFee}(recipients, amounts, reasons, "");

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

    /// @dev Calculates the fee for a given amount and basis points.
    function _calculateFee(uint256 amount, uint256 bps) internal pure returns (uint256) {
        return (amount * bps) / 10_000;
    }

    modifier onlyGovernance() {
        require(msg.sender == owner() || msg.sender == address(governanceContract), "Not authorized");
        _;
    }

    // Update existing functions to use new modifier
    function upgradeParameters(
        uint256 _MAX_TOTAL_SUPPLY,
        uint256 _PRIMARY_MARKET_SUPPLY,
        uint256 _SECONDARY_MARKET_SUPPLY,
        uint256 _TOTAL_FEE_BPS,
        uint256 _TOKEN_CREATOR_FEE_BPS,
        uint256 _PROTOCOL_FEE_BPS,
        uint256 _PLATFORM_REFERRER_FEE_BPS,
        uint256 _ORDER_REFERRER_FEE_BPS,
        uint256 _MIN_ORDER_SIZE,
        uint256 _graduationFee
    ) external onlyGovernance {
        MAX_TOTAL_SUPPLY = _MAX_TOTAL_SUPPLY;
        PRIMARY_MARKET_SUPPLY = _PRIMARY_MARKET_SUPPLY;
        SECONDARY_MARKET_SUPPLY = _SECONDARY_MARKET_SUPPLY;
        TOTAL_FEE_BPS = _TOTAL_FEE_BPS;
        TOKEN_CREATOR_FEE_BPS = _TOKEN_CREATOR_FEE_BPS;
        PROTOCOL_FEE_BPS = _PROTOCOL_FEE_BPS;
        PLATFORM_REFERRER_FEE_BPS = _PLATFORM_REFERRER_FEE_BPS;
        ORDER_REFERRER_FEE_BPS = _ORDER_REFERRER_FEE_BPS;
        MIN_ORDER_SIZE = _MIN_ORDER_SIZE;
        uint oldFee = graduationFee;
        graduationFee = _graduationFee;
        emit TokenParametersUpdated(_MAX_TOTAL_SUPPLY, _PRIMARY_MARKET_SUPPLY, _SECONDARY_MARKET_SUPPLY);
        emit GraduationFeeUpdated(oldFee, _graduationFee);
    }

    // Add function to update protocol addresses through governance
    function updateProtocolAddresses(
        address _protocolFeeRecipient,
        address _protocolRewards,
        address _weth,
        address _nonfungiblePositionManager,
        address _swapRouter
    ) external onlyGovernance {
        _setProtocolAddresses(
            _protocolFeeRecipient,
            _protocolRewards,
            _weth,
            _nonfungiblePositionManager,
            _swapRouter
        );
        
        emit ProtocolAddressesUpdated(
            _protocolFeeRecipient,
            _protocolRewards,
            _weth,
            _nonfungiblePositionManager,
            _swapRouter
        );
    }

    // Internal function for setting protocol addresses
    function _setProtocolAddresses(
        address _protocolFeeRecipient,
        address _protocolRewards,
        address _weth,
        address _nonfungiblePositionManager,
        address _swapRouter
    ) internal {
        if (_protocolFeeRecipient == address(0)) revert AddressZero();
        if (_protocolRewards == address(0)) revert AddressZero();
        if (_weth == address(0)) revert AddressZero();
        if (_nonfungiblePositionManager == address(0)) revert AddressZero();
        if (_swapRouter == address(0)) revert AddressZero();

        protocolFeeRecipient = _protocolFeeRecipient;
        protocolRewards = _protocolRewards;
        WETH = _weth;
        nonfungiblePositionManager = _nonfungiblePositionManager;
        swapRouter = _swapRouter;
    }

    event ProtocolAddressesUpdated(
        address protocolFeeRecipient,
        address protocolRewards,
        address weth,
        address nonfungiblePositionManager,
        address swapRouter
    );

    function setGovernanceContract(address _governanceContract) external onlyOwner {
        require(_governanceContract != address(0), "Zero address not allowed");
        governanceContract = _governanceContract;
        emit GovernanceContractUpdated(_governanceContract);
    }

    event GovernanceContractUpdated(address newGovernanceContract);

    /// @notice Creates the Uniswap V2 pool during market graduation
    function _createAndInitializePool() internal returns (address pair) {
        // Use the subsidy contract to create the pool
        pair = PoolCreationSubsidy(payable(poolCreationSubsidy)).createPool(address(this), WETH);
        
        poolAddress = pair;
        return pair;
    }

    /// @notice Handles the market graduation process
    function _handleMarketGraduation(uint256 ethLiquidity) internal {
        if (marketType != MarketType.BONDING_CURVE) revert MarketAlreadyGraduated();
        
        // Create the pool using the subsidy contract
        address pair = _createAndInitializePool();
        
        // Transfer the graduation fee
        _transfer(msg.sender, address(this), graduationFee);
        
        // Update market type
        marketType = MarketType.UNISWAP_POOL;
        
        // Add initial liquidity to the V2 pool
        _addInitialLiquidity(pair, ethLiquidity);
        
        emit AICOMarketGraduated(
            address(this),
            pair,
            ethLiquidity,
            SECONDARY_MARKET_SUPPLY,
            0, // No position ID in V2
            marketType
        );
    }

    /// @notice Adds initial liquidity to the Uniswap V2 pool
    function _addInitialLiquidity(address pair, uint256 ethLiquidity) internal {
        // Transfer tokens to the pair
        _transfer(address(this), pair, SECONDARY_MARKET_SUPPLY);
        IWETH(WETH).deposit{value: ethLiquidity}();
        IWETH(WETH).transfer(pair, ethLiquidity);
        
        // Initialize the pair
        IUniswapV2Pair(pair).mint(address(this));
    }

    /// @notice Buy tokens with BAG
    /// @param _recipient Address to receive the tokens
    /// @param _orderReferrer Address of the order referrer
    /// @param _comment Optional comment for the transaction
    /// @param _minTokensOut Minimum tokens to receive (slippage protection)
    /// @param _deadline Transaction deadline timestamp
    function buy(
        address _recipient,
        address _orderReferrer,
        string memory _comment,
        uint256 _bagAmount,
        uint256 _minTokensOut,
        uint256 _deadline
    ) external nonReentrant returns (uint256 tokensBought) {
        if (_recipient == address(0)) revert AddressZero();
        if (_bagAmount < MIN_ORDER_SIZE) revert OrderTooSmall();
        if (block.timestamp > _deadline) revert DeadlineExpired();

        // Calculate fee
        uint256 fee = (_bagAmount * TOTAL_FEE_BPS) / 10_000;
        uint256 bagAfterFee = _bagAmount - fee;

        if (marketType == MarketType.BONDING_CURVE) {
            // Get current supply excluding Agent allocation
            uint256 currentSupply = totalSupply() - AGENT_ALLOCATION;
            if (currentSupply >= PRIMARY_MARKET_SUPPLY) revert MaxSupplyReached();

            // Calculate tokens to mint using bonding curve
            tokensBought = bondingCurve.getBAGBuyQuote(currentSupply, bagAfterFee);
            if (tokensBought < _minTokensOut) revert SlippageExceeded();

            // Transfer BAG tokens from buyer
            require(BAG.transferFrom(msg.sender, address(this), _bagAmount), "BAG transfer failed");

            // Mint tokens to recipient
            _mint(_recipient, tokensBought);

            // Handle fees
            _disperseFees(fee, _orderReferrer);

            // Check if we need to graduate to Uniswap
            if (totalSupply() - AGENT_ALLOCATION >= PRIMARY_MARKET_SUPPLY) {
                _graduateToUniswap();
            }
        } else {
            // Market has graduated to Uniswap
            require(poolAddress != address(0), "Pool not initialized");
            
            // Transfer BAG tokens from buyer
            require(BAG.transferFrom(msg.sender, address(this), _bagAmount), "BAG transfer failed");

            // Approve Uniswap router
            BAG.approve(address(swapRouter), bagAfterFee);

            // Swap on Uniswap
            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
                tokenIn: address(BAG),
                tokenOut: address(this),
                fee: LP_FEE,
                recipient: _recipient,
                deadline: _deadline,
                amountIn: bagAfterFee,
                amountOutMinimum: _minTokensOut,
                sqrtPriceLimitX96: 0
            });

            tokensBought = ISwapRouter(swapRouter).exactInputSingle(params);

            // Handle fees
            _disperseFees(fee, _orderReferrer);
        }

        emit AICOTokenBuy(
            msg.sender,
            _recipient,
            _orderReferrer,
            _bagAmount,
            fee,
            bagAfterFee,
            tokensBought,
            balanceOf(_recipient),
            _comment,
            totalSupply(),
            marketType
        );
    }

    /// @notice Sell tokens for BAG
    /// @param _recipient Address to receive the BAG tokens
    /// @param _orderReferrer Address of the order referrer
    /// @param _comment Optional comment for the transaction
    /// @param _tokensToSell Amount of tokens to sell
    /// @param _minBagOut Minimum BAG to receive (slippage protection)
    /// @param _deadline Transaction deadline timestamp
    function sell(
        address _recipient,
        address _orderReferrer,
        string memory _comment,
        uint256 _tokensToSell,
        uint256 _minBagOut,
        uint256 _deadline
    ) external nonReentrant returns (uint256 bagReceived) {
        if (_recipient == address(0)) revert AddressZero();
        if (_tokensToSell < MIN_ORDER_SIZE) revert OrderTooSmall();
        if (block.timestamp > _deadline) revert DeadlineExpired();

        if (marketType == MarketType.BONDING_CURVE) {
            // Get current supply excluding Agent allocation
            uint256 currentSupply = totalSupply() - AGENT_ALLOCATION;

            // Calculate BAG to receive using bonding curve
            bagReceived = bondingCurve.getTokenSellQuote(currentSupply, _tokensToSell);
            if (bagReceived < _minBagOut) revert SlippageExceeded();

            // Calculate fee
            uint256 fee = (bagReceived * TOTAL_FEE_BPS) / 10_000;
            uint256 bagAfterFee = bagReceived - fee;

            // Burn tokens from seller
            _burn(msg.sender, _tokensToSell);

            // Transfer BAG to recipient
            require(BAG.transfer(_recipient, bagAfterFee), "BAG transfer failed");

            // Handle fees
            _disperseFees(fee, _orderReferrer);
        } else {
            // Market has graduated to Uniswap
            require(poolAddress != address(0), "Pool not initialized");

            // Transfer tokens from seller
            _transfer(msg.sender, address(this), _tokensToSell);

            // Approve Uniswap router
            _approve(address(this), address(swapRouter), _tokensToSell);

            // Swap on Uniswap
            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
                tokenIn: address(this),
                tokenOut: address(BAG),
                fee: LP_FEE,
                recipient: address(this),
                deadline: _deadline,
                amountIn: _tokensToSell,
                amountOutMinimum: _minBagOut,
                sqrtPriceLimitX96: 0
            });

            bagReceived = ISwapRouter(swapRouter).exactInputSingle(params);

            // Calculate fee
            uint256 fee = (bagReceived * TOTAL_FEE_BPS) / 10_000;
            uint256 bagAfterFee = bagReceived - fee;

            // Transfer BAG to recipient
            require(BAG.transfer(_recipient, bagAfterFee), "BAG transfer failed");

            // Handle fees
            _disperseFees(fee, _orderReferrer);
        }

        emit AICOTokenSell(
            msg.sender,
            _recipient,
            _orderReferrer,
            bagReceived,
            bagReceived - bagAfterFee,
            bagAfterFee,
            _tokensToSell,
            balanceOf(msg.sender),
            _comment,
            totalSupply(),
            marketType
        );
    }

    /// @dev Internal function to handle graduation to Uniswap
    function _graduateToUniswap() internal {
        // Collect graduation fee
        require(BAG.transferFrom(msg.sender, address(this), graduationFee), "Graduation fee transfer failed");
        _disperseFees(graduationFee, address(0));

        // Create Uniswap V2 pool
        poolAddress = IUniswapV2Factory(uniswapV2Factory).createPair(address(this), address(BAG));

        // Mint secondary market supply
        _mint(address(this), SECONDARY_MARKET_SUPPLY);

        // Approve tokens for pool
        _approve(address(this), poolAddress, SECONDARY_MARKET_SUPPLY);
        BAG.approve(poolAddress, type(uint256).max);

        // Add initial liquidity
        (uint256 ethLiquidity, uint256 tokenLiquidity, uint256 lpTokens) = PoolCreationSubsidy(poolCreationSubsidy).createPool(
            address(this),
            SECONDARY_MARKET_SUPPLY
        );

        // Update market type
        marketType = MarketType.UNISWAP_POOL;

        emit AICOMarketGraduated(
            address(this),
            poolAddress,
            ethLiquidity,
            tokenLiquidity,
            lpTokens,
            marketType
        );
    }
} 