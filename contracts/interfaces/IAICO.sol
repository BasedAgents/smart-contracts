// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAICO {
    /// @notice Thrown when an operation is attempted with a zero address
    error AddressZero();

    /// @notice Thrown when an invalid market type is specified
    error InvalidMarketType();

    /// @notice Thrown when there are insufficient funds for an operation
    error InsufficientFunds();

    /// @notice Thrown when there is insufficient liquidity for a transaction
    error InsufficientLiquidity();

    /// @notice Thrown when the slippage bounds are exceeded during a transaction
    error SlippageBoundsExceeded();

    /// @notice Thrown when the initial order size is too large
    error InitialOrderSizeTooLarge();

    /// @notice Thrown when the ETH amount is too small for a transaction
    error EthAmountTooSmall();

    /// @notice Thrown when an ETH transfer fails
    error EthTransferFailed();

    /// @notice Thrown when an operation is attempted by an entity other than the pool
    error OnlyPool();

    /// @notice Thrown when an operation is attempted by an entity other than WETH
    error OnlyWeth();

    /// @notice Thrown when a market is not yet graduated
    error MarketNotGraduated();

    /// @notice Thrown when a market is already graduated
    error MarketAlreadyGraduated();

    /// @notice Represents the type of market
    enum MarketType {
        BONDING_CURVE,
        UNISWAP_POOL
    }

    /// @notice Represents the state of the market
    struct MarketState {
        MarketType marketType;
        address marketAddress;
    }

    // Events renamed from Bag to AICO
    event AICOTokenBuy(
        address indexed buyer,
        address indexed recipient,
        address indexed orderReferrer,
        uint256 totalEth,
        uint256 ethFee,
        uint256 ethSold,
        uint256 tokensBought,
        uint256 buyerTokenBalance,
        string comment,
        uint256 totalSupply,
        MarketType marketType
    );

    event AICOTokenSell(
        address indexed seller,
        address indexed recipient,
        address indexed orderReferrer,
        uint256 totalEth,
        uint256 ethFee,
        uint256 ethBought,
        uint256 tokensSold,
        uint256 sellerTokenBalance,
        string comment,
        uint256 totalSupply,
        MarketType marketType
    );

    event AICOTokenTransfer(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 fromTokenBalance,
        uint256 toTokenBalance,
        uint256 totalSupply
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

    event AICOMarketGraduated(
        address indexed tokenAddress,
        address indexed poolAddress,
        uint256 totalEthLiquidity,
        uint256 totalTokenLiquidity,
        uint256 lpPositionId,
        MarketType marketType
    );

    event GraduationFeeUpdated(
        uint256 oldFee,
        uint256 newFee
    );

    event TokenParametersUpdated(
        uint256 _maxSupply,
        uint256 _primarySupply,
        uint256 _secondarySupply
    );

    function tokenURI() external view returns (string memory);

    function tokenCreator() external view returns (address);

    function platformReferrer() external view returns (address);
} 