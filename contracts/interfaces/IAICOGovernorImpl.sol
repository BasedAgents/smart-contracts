// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/governance/utils/IVotes.sol";

interface IAICOGovernorImpl {
    function initialize(
        IVotes _token,
        address _tokenCreator,
        uint48 _votingDelay,
        uint32 _votingPeriod,
        uint256 _proposalThreshold
    ) external;

    function setVotingDelay(uint256 newVotingDelay) external;
    function setVotingPeriod(uint256 newVotingPeriod) external;
    function setProposalThreshold(uint256 newProposalThreshold) external;
    function setToken(address newToken) external;
    function setProposerRights(address account, bool hasRights) external;
    function transferOwnership(address newOwner) external;
} 