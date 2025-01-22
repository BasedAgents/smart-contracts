// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts-upgradeable/governance/GovernorUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorSettingsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorCountingSimpleUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesQuorumFractionUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/governance/utils/IVotes.sol";

/**
 * @title AICOGovernorImpl
 */
contract AICOGovernorImpl is
    Initializable,
    GovernorUpgradeable,
    GovernorSettingsUpgradeable,
    GovernorCountingSimpleUpgradeable,
    GovernorVotesUpgradeable,
    GovernorVotesQuorumFractionUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    mapping(address => bool) public proposalRights;
    bool public openProposals;
    uint256 public proposalMinimumBalance;
    address public tokenCreator;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        IVotes _token,
        address _tokenCreator,
        uint48 _votingDelay,
        uint32 _votingPeriod,
        uint256 _proposalThreshold
    ) external initializer {
        __Governor_init("AICOGovernorImpl");
        __GovernorSettings_init(_votingDelay, _votingPeriod, _proposalThreshold);
        __GovernorCountingSimple_init();
        __GovernorVotes_init(_token);
        __GovernorVotesQuorumFraction_init(10); // 10%
        __Ownable_init(_tokenCreator);
        __UUPSUpgradeable_init();

        tokenCreator = _tokenCreator;
        proposalRights[_tokenCreator] = true;
        openProposals = false;
        proposalMinimumBalance = 0;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public virtual override returns (uint256) {
        require(_hasProposalRights(msg.sender), "AICOGovernorImpl: cannot propose");
        return super.propose(targets, values, calldatas, description);
    }

    function _hasProposalRights(address account) internal view returns (bool) {
        if (proposalRights[account]) {
            return true;
        }
        if (openProposals) {
            if (proposalMinimumBalance > 0) {
                return getVotes(account, block.number - 1) >= proposalMinimumBalance;
            }
            return true;
        }
        return false;
    }

    function setProposerRights(address account, bool hasRights) external onlyOwner {
        proposalRights[account] = hasRights;
    }

    function updateProposalRights(bool _open, uint256 _minBalance) external onlyOwner {
        openProposals = _open;
        proposalMinimumBalance = _minBalance;
    }

    // Overridden from GovernorSettings
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
