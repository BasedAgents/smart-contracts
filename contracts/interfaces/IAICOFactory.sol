// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IAICOFactory {
    /// @notice Emitted when a new AICO token is created
    event AICOTokenCreated(
        address indexed factoryAddress,
        address indexed tokenCreator,
        address platformReferrer,
        address protocolFeeRecipient,
        address bondingCurve,
        string tokenURI,
        string name,
        string symbol,
        address tokenAddress,
        address poolAddress
    );

    event GovernorCreated(
        address indexed token,
        address indexed governor,
        address indexed tokenCreator,
        uint48 votingDelay,
        uint32 votingPeriod,
        uint256 proposalThreshold
    );

    /// @notice Deploys an AICO ERC20 token
    function deploy(
        address _tokenCreator,
        address _platformReferrer,
        address _agentWallet,
        string memory _tokenURI,
        string memory _name,
        string memory _symbol,
        uint48 _votingDelay,
        uint32 _votingPeriod,
        uint256 _proposalThreshold
    ) external payable returns (address token, address governance);
} 