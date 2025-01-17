// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {GovernorUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/GovernorUpgradeable.sol";
import {GovernorSettingsUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorSettingsUpgradeable.sol";
import {GovernorCountingSimpleUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorCountingSimpleUpgradeable.sol";
import {GovernorVotesUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesUpgradeable.sol";
import {GovernorVotesQuorumFractionUpgradeable} from "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesQuorumFractionUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";

/* 
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    

    AICO        AICO        AICO    
*/
contract AICOGovernor is 
    Initializable,
    GovernorUpgradeable, 
    GovernorSettingsUpgradeable, 
    GovernorCountingSimpleUpgradeable, 
    GovernorVotesUpgradeable,
    GovernorVotesQuorumFractionUpgradeable,
    OwnableUpgradeable
{
    address public agentCreator;

    function initialize(
        IVotes _token, 
        address _agentCreator,
        uint48 _votingDelay,      // e.g. 1 block
        uint32 _votingPeriod,     // e.g. 45818 blocks (~ 1 week)
        uint256 _proposalThreshold // e.g. 0 tokens
    ) initializer public {
        __Governor_init("AICOGovernor");
        __GovernorSettings_init(
            _votingDelay,     // initial voting delay 
            _votingPeriod,    // initial voting period
            _proposalThreshold // initial proposal threshold
        );
        __GovernorCountingSimple_init();
        __GovernorVotes_init(_token);
        __GovernorVotesQuorumFraction_init(10); // 10% quorum
        __Ownable_init(_agentCreator);

        agentCreator = _agentCreator;
    }

    // Override propose function to restrict proposal creation
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public virtual override returns (uint256) {
        // Only Agent creator can create proposals
        require(
            msg.sender == agentCreator, 
            "AICOGovernor: Only Agent creator can create proposals"
        );
        
        return super.propose(targets, values, calldatas, description);
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