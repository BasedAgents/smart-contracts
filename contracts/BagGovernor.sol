// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts-upgradeable/governance/GovernorUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorSettingsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorCountingSimpleUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesQuorumFractionUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract BagGovernor is 
    Initializable,
    GovernorUpgradeable, 
    GovernorSettingsUpgradeable, 
    GovernorCountingSimpleUpgradeable, 
    GovernorVotesUpgradeable,
    GovernorVotesQuorumFractionUpgradeable,
    OwnableUpgradeable
{

    function initialize(
        IVotes _token, 
        uint48 _votingDelay,      // e.g. 1 block
        uint32 _votingPeriod,     // e.g. 45818 blocks (~ 1 week)
        uint256 _proposalThreshold // e.g. 0 tokens
    ) initializer public {
        __Governor_init("BagGovernor");
        __GovernorSettings_init(
            _votingDelay,     // initial voting delay 
            _votingPeriod,    // initial voting period
            _proposalThreshold // initial proposal threshold
        );
        __GovernorCountingSimple_init();
        __GovernorVotes_init(_token);
        __GovernorVotesQuorumFraction_init(10); // 10% quorum
        __Ownable_init(msg.sender);
    }

    // The following functions are overrides required by Solidity.
    function votingDelay()
        public
        view
        override(GovernorUpgradeable, GovernorSettingsUpgradeable)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(GovernorUpgradeable, GovernorSettingsUpgradeable)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function proposalThreshold() 
        public 
        view
        override(GovernorUpgradeable, GovernorSettingsUpgradeable)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    // Optional: Add function to update governance parameters
    function updateGovernanceParameters(
        uint48 _votingDelay,
        uint32 _votingPeriod,
        uint256 _proposalThreshold
    ) external onlyOwner {
        _setVotingDelay(_votingDelay);
        _setVotingPeriod(_votingPeriod);
        _setProposalThreshold(_proposalThreshold);
    }
}