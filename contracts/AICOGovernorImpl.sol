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

/* 
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    
    !!!         !!!         !!!    

    AICO        AICO        AICO    
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
    /// @dev Token creator address that has exclusive proposal rights
    address public tokenCreator;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the governance contract with required parameters
    /// @param _token The ERC20 token that will be used for voting
    /// @param _tokenCreator Address that will have exclusive proposal rights
    /// @param _votingDelay Time between proposal creation and voting start
    /// @param _votingPeriod Duration of voting
    /// @param _proposalThreshold Minimum tokens required to create a proposal
    function initialize(
        IVotesUpgradeable _token, 
        address _tokenCreator,
        uint48 _votingDelay,
        uint32 _votingPeriod,
        uint256 _proposalThreshold
    ) external initializer {
        __Governor_init("AICOGovernor");
        __GovernorSettings_init(
            _votingDelay,
            _votingPeriod,
            _proposalThreshold
        );
        __GovernorCountingSimple_init();
        __GovernorVotes_init(_token);
        __GovernorVotesQuorumFraction_init(10); // 10% quorum
        __Ownable_init(_tokenCreator);
        __UUPSUpgradeable_init();

        tokenCreator = _tokenCreator;
    }

    /// @notice Creates a proposal - restricted to token creator
    /// @dev Overrides the standard propose function to add access control
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public virtual override returns (uint256) {
        require(
            msg.sender == tokenCreator, 
            "AICOGovernor: Only token creator can create proposals"
        );
        
        return super.propose(targets, values, calldatas, description);
    }

    // Required overrides for the governance functionality
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

    /// @notice Updates key governance parameters
    /// @dev Only callable by contract owner (token creator)
    /// @param _votingDelay New voting delay
    /// @param _votingPeriod New voting period
    /// @param _proposalThreshold New proposal threshold
    function updateGovernanceParameters(
        uint48 _votingDelay,
        uint32 _votingPeriod,
        uint256 _proposalThreshold
    ) external onlyOwner {
        _setVotingDelay(_votingDelay);
        _setVotingPeriod(_votingPeriod);
        _setProposalThreshold(_proposalThreshold);
    }

    /// @dev Required override for UUPS upgradeable pattern
    /// @param newImplementation Address of new implementation
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /// @notice Returns current implementation address
    function implementation() external view returns (address) {
        return ERC1967Utils.getImplementation();
    }
} 