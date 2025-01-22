// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/governance/utils/IVotes.sol";

interface IAICO is IVotes {
    function initialize(
        address tokenCreator,
        address platformReferrer,
        address bondingCurve,
        address agentWallet,
        address bagToken,
        string memory tokenURI,
        string memory name,
        string memory symbol,
        address poolSubsidy,
        address uniswapFactory,
        address protocolFeeRecipient,
        address protocolRewards,
        address owner,
        address governanceContract
    ) external;

    function setGovernanceContract(address _governanceContract) external;
    function AGENT_ALLOCATION() external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transferOwnership(address newOwner) external;
} 