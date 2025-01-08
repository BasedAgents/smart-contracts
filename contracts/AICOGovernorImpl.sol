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
    /// @dev Agent creator address that initially has exclusive proposal rights
    address public agentCreator;

    /// @dev Minimum token balance required to create proposals (0 means no minimum)
    uint256 public proposalMinimumBalance;

    /// @dev Whether any token holder can create proposals
    bool public openProposals;

    /// @dev Mapping of addresses explicitly granted proposal rights
    mapping(address => bool) public proposalRights;

    /// @notice Emitted when proposal rights configuration is updated
    event ProposalRightsUpdated(bool openProposals, uint256 minimumBalance);
    
    /// @notice Emitted when an address's proposal rights are updated
    event ProposerRightsUpdated(address indexed account, bool hasRights);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the governance contract with required parameters
    /// @param _token The ERC20 token that will be used for voting
    /// @param _tokenCreator Address that will have initial proposal rights
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
        proposalRights[_tokenCreator] = true;
        openProposals = false;
        proposalMinimumBalance = 0;
    }

    /// @notice Creates a proposal if caller has the right to do so
    /// @dev Checks various conditions for proposal rights
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public virtual override returns (uint256) {
        require(
            _hasProposalRights(msg.sender),
            "AICOGovernor: Caller cannot create proposals"
        );
        
        return super.propose(targets, values, calldatas, description);
    }

    /// @notice Checks if an address has the right to create proposals
    /// @dev Internal function to consolidate proposal rights logic
    function _hasProposalRights(address account) internal view returns (bool) {
        if (openProposals) {
            // If proposals are open to all, just check minimum balance
            if (proposalMinimumBalance > 0) {
                return getVotes(account, block.number - 1) >= proposalMinimumBalance;
            }
            return true;
        }
        // Otherwise, check explicit rights
        return proposalRights[account];
    }

    /// @notice Updates the proposal rights configuration
    /// @dev Only callable by owner (Agent creator)
    /// @param _openProposals Whether any token holder can create proposals
    /// @param _minimumBalance Minimum token balance required for proposals
    function updateProposalRights(
        bool _openProposals,
        uint256 _minimumBalance
    ) external onlyOwner {
        openProposals = _openProposals;
        proposalMinimumBalance = _minimumBalance;
        emit ProposalRightsUpdated(_openProposals, _minimumBalance);
    }

    /// @notice Grants or revokes proposal rights for a specific address
    /// @dev Only callable by owner (Agent creator)
    /// @param account Address to update rights for
    /// @param hasRights Whether the address should have proposal rights
    function setProposerRights(address account, bool hasRights) external onlyOwner {
        require(account != address(0), "Invalid address");
        proposalRights[account] = hasRights;
        emit ProposerRightsUpdated(account, hasRights);
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
    /// @dev Only callable by contract owner (Agent creator)
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