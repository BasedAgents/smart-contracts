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
    address public immutable WETH;
    address public immutable nonfungiblePositionManager;
    address public immutable swapRouter;
    address public immutable protocolFeeRecipient;
    address public immutable protocolRewards;

    BondingCurve public bondingCurve;
    MarketType public marketType;
    address public platformReferrer;
    address public poolAddress;
    address public tokenCreator;
    string public tokenURI;
    uint256 public graduationFee;

    constructor(
        address _protocolFeeRecipient,
        address _protocolRewards,
        address _weth,
        address _nonfungiblePositionManager,
        address _swapRouter
    ) initializer {
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

    /// @notice Initializes a new AICO token
    /// @param _tokenCreator The address of the token creator
    /// @param _platformReferrer The address of the platform referrer
    /// @param _bondingCurve The address of the bonding curve module
    /// @param _tokenURI The ERC20z token URI
    /// @param _name The token name
    /// @param _symbol The token symbol
    function initialize(
        address _tokenCreator,
        address _platformReferrer,
        address _bondingCurve,
        string memory _tokenURI,
        string memory _name,
        string memory _symbol
    ) external payable initializer {
        // ... rest of the initialization code ...
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

    // setter function
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
    ) external onlyOwner {
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
} 