# Technical Documentation: Governance System for BasedAgents

## **Overview**

This document outlines the technical implementation of a governance system for AI agents deployed on BasedAgents. The system combines on-chain governance with off-chain operational logic, allowing token holders to:

1. Vote on governance decisions using OpenZeppelin Governor.
2. Control the agent’s wallet and smart contract logic.
3. Customize the agent’s default governance setup to suit their needs.
4. Delegate voting power to delegates.

## **System Components**

### **1. Agent Wallet Custody**

- **Default Wallet**: Coinbase MPC Wallet.
- **Purpose**: Holds and manages the agent’s funds.
- **Flexibility**: Token holders can vote to migrate funds to another wallet type, such as a Gnosis Safe or a custom smart contract.

### **2. On-Chain Governance**

Governance decisions are implemented entirely on-chain using OpenZeppelin Governor. Key responsibilities include:

- Electing or replacing the governance address (e.g., DAO, multisig, or individual wallet).
- Updating smart contracts (e.g., DelayModule, VetoContract) that define agent behavior.
- Modifying governance parameters, such as quorum, voting thresholds, and delay durations.

### **3. Agent Logic Customization**

- **Default Setup**: Every agent starts with a pre-deployed DelayModule and VetoContract.
- **Customization**: Token holders can replace these contracts to define their agent’s governance and financial rules.

### **4. Integration with AgentKit**

AgentKit provides the operational layer for the agent to:

- Propose transactions.
- Validate actions against on-chain governance rules.
- Enforce off-chain guardrails (e.g., 2FA or spending limits).

### **5. AgentKit Details**

AgentKit, as provided by Coinbase, facilitates:

- **Arbitrary Contract Reads and Writes**: Agents can interact with governance contracts to verify permissions, check thresholds, or confirm veto statuses.
- **Transaction Guardrails**: Dynamic checks (e.g., spending limits, approval thresholds) implemented directly in the agent’s logic.
- **Wallet Integration**: Seamless interaction with Coinbase MPC Wallets for secure fund management.
- **Extensibility**: AgentKit’s Python and JavaScript compatibility allows additional workflows, such as user approval (2FA) for large transactions.

---

## **Default Governance Architecture**

### **1. AICOGovernor.sol**

The AICOGovernor contract is used to enable governance functionality for token holders with flexible parameters and controls. It ensures that the governance logic can adapt over time and includes the following features:

- **Flexible Governance Parameters**: Allows updating of quorum, voting delays, voting periods, and thresholds.
- **Controlled Proposal Creation**: Only the token creator can initiate proposals.
- **Upgradeable Design**: Supports updates to the governance logic using proxy patterns.

#### **Governor Contract Code**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts-upgradeable/governance/GovernorUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorSettingsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorCountingSimpleUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/governance/extensions/GovernorVotesQuorumFractionUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract AICOGovernor is 
    Initializable,
    GovernorUpgradeable, 
    GovernorSettingsUpgradeable, 
    GovernorCountingSimpleUpgradeable, 
    GovernorVotesUpgradeable,
    GovernorVotesQuorumFractionUpgradeable,
    OwnableUpgradeable
{
    address public tokenCreator;

    function initialize(
        IVotesUpgradeable _token, 
        address _tokenCreator,
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
        __Ownable_init(_tokenCreator);

        tokenCreator = _tokenCreator;
    }

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
```

### **2. DelayModule**

The DelayModule enforces a time buffer for agent-initiated actions. Features include:

- A configurable delay period (e.g., 48 hours).
- Blocking execution if a veto is issued during the delay.

#### **DelayModule Contract Code**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IVetoContract {
    function isVetoed(bytes32 txHash) external view returns (bool);
}

contract DelayModule {
    IVetoContract public vetoContract;
    uint256 public delayDuration; // Delay in seconds
    mapping(bytes32 => uint256) public proposedAt; // Tracks when transactions were proposed

    event TransactionProposed(bytes32 indexed txHash, uint256 timestamp);
    event TransactionExecuted(bytes32 indexed txHash);

    constructor(address _vetoContract, uint256 _delayDuration) {
        vetoContract = IVetoContract(_vetoContract);
        delayDuration = _delayDuration;
    }

    function proposeTransaction(bytes32 txHash) external {
        require(proposedAt[txHash] == 0, "Transaction already proposed");
        proposedAt[txHash] = block.timestamp;
        emit TransactionProposed(txHash, block.timestamp);
    }

    function executeTransaction(bytes32 txHash) external {
        require(proposedAt[txHash] > 0, "Transaction not proposed");
        require(block.timestamp >= proposedAt[txHash] + delayDuration, "Delay period not over");
        require(!vetoContract.isVetoed(txHash), "Transaction vetoed");

        delete proposedAt[txHash]; // Remove from proposed transactions
        emit TransactionExecuted(txHash);

        // Add your execution logic here
    }
}
```

### **3. VetoContract**

The VetoContract allows a designated governance address (director/BoD) to veto transactions during the delay period. Token holders can replace the veto authority through governance.

#### **VetoContract Code**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

contract VetoContract {
    address public director; // Current veto authority
    mapping(bytes32 => bool) public vetoedTransactions; // Tracks vetoed transactions

    event VetoAuthorityUpdated(address indexed oldDirector, address indexed newDirector);
    event TransactionVetoed(bytes32 indexed txHash);

    constructor(address _initialDirector) {
        director = _initialDirector;
    }

    function updateDirector(address _newDirector) external {
        require(msg.sender == director, "Only current director can update");
        emit VetoAuthorityUpdated(director, _newDirector);
        director = _newDirector;
    }

    function vetoTransaction(bytes32 txHash) external {
        require(msg.sender == director, "Only director can veto");
        vetoedTransactions[txHash] = true;
        emit TransactionVetoed(txHash);
    }

    function isVetoed(bytes32 txHash) external view returns (bool) {
        return vetoedTransactions[txHash];
    }
}
```

---

## **Example Workflow**

### **Agent Deployment**

1. **Step 1**: Deploy an agent named "Nova" with:

   - Coinbase MPC Wallet for custody.
   - Default DelayModule and VetoContract.
   - Governance controlled by the deployer.

2. **Step 2**: Token holders receive Nova tokens (ERC20Votes).

### **Governance Actions**

#### **1. Elect a Governance Address**

- Token holders vote to replace the deployer’s address with a DAO.
- The update is implemented on-chain via the Governor contract.

#### **2. Customize Agent Logic**

- Token holders vote to replace the default DelayModule with a custom smart contract.
- The Governor contract executes the upgrade on-chain.

#### **3. Change GitHub Repository**

- Token holders vote to link Nova’s Docker container to a new GitHub repository.
- BasedAgents Admin updates the link manually based on the vote outcome.

### **Agent Operations**

1. **Transaction Proposal**:

   - Nova proposes a 10 ETH transaction to a recipient.
   - The DelayModule starts the delay timer.

2. **Veto Opportunity**:

   - The VetoContract checks if the governance address vetoes the transaction.
   - If vetoed, the transaction is blocked.

3. **Execution**:

   - After the delay, the transaction is executed if no veto exists.

---

## **Future Customization**

1. **Flexible Wallet Custody**:

   - Token holders can vote to migrate funds from Coinbase MPC Wallet to Gnosis Safe or other wallet types.

2. **Custom Governance Contracts**:

   - Replace the VetoContract with advanced modules tailored to specific agent needs.

3. **AI Logic Enhancements**:

   - Integrate advanced AgentKit features, such as dynamic risk thresholds or 2FA for specific actions.

---

## **Conclusion**

This governance system provides:

- **Token Holder Control**: Comprehensive on-chain governance over agent funds and logic.
- **Agent Autonomy**: Agents can operate independently within the guardrails defined by governance.
- **Flexibility**: Default logic can evolve to meet the needs of specific agents and their token holders.


