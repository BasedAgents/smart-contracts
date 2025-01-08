# Based Agents Governance

## Overview
Based Agents implements two distinct layers of governance:
1. Protocol Governance: Initially controlled by Community Multisig, transitioning to Genesis Agent governance
2. Agent Governance: Each Agent token provides governance over its specific Agent

## 1. Protocol Governance ($BAG)

### Structure
Protocol governance follows a progressive path toward full decentralization:

1. **Initial Phase: Community Multisig**
   - A trusted group of community members controls protocol operations
   - Handles token grants and community rewards
   - Manages token burns and emissions
   - Controls protocol parameter updates
   - May implement token holder voting for key decisions

2. **Transition Phase: Genesis Agent**
   - The Genesis Agent is the first and most important Agent on the platform
   - Will gradually assume control of protocol governance from the Community Multisig
   - Controlled by $BAG token holders through governance
   - Powers transferred progressively as Genesis Agent proves stability
   - Represents the ultimate form of dogfooding - an AI Agent governing an AI Agent protocol

3. **Vote Delegation**
   - $BAG implements ERC20Votes for efficient governance
   - Token holders can delegate voting power to active community members
   - Delegates vote on behalf of their delegators
   - Reduces governance overhead for passive holders
   - Enables more active and engaged governance

### Governance Powers
The protocol-level governance (initially Multisig, later Genesis Agent) can:
- Vote on protocol upgrades and parameters
- Control framework integrations
- Manage protocol fees and revenue
- Guide protocol development and roadmap
- Propose and vote on protocol improvements

### Voting Parameters
- Voting Period: 7 days
- Quorum: 20% of total $BAG supply
- Threshold: >66% of votes in favor
- Delay Period: 48 hours

### Proposal Types
1. **Protocol Upgrades**
   - Smart contract upgrades
   - Security parameter changes
   - Framework integrations

2. **Economic Parameters**
   - Fee structures
   - Revenue distribution
   - Market mechanisms

3. **Strategic Decisions**
   - Roadmap priorities
   - Framework partnerships
   - Major feature releases

4. **Genesis Agent Control**
   - Approval of power transfers from Multisig to Genesis Agent
   - Genesis Agent parameter updates
   - Genesis Agent strategic decisions

## 2. Agent Governance

### Overview
Each Agent token launched as an AICO (AI Coin Offering) provides governance rights over its specific Agent through a flexible system that can evolve from centralized to decentralized control.

### Contract Structure
The Agent governance system consists of three main contracts:

1. **AICOGovernor**:
   - Handles standard governance operations
   - Manages proposals and voting
   - Controls critical system changes
   - Higher thresholds for fundamental changes

2. **VetoContract**:
   - Enables token holder veto rights
   - Manages veto voting process
   - Lower thresholds for operational vetoes
   - Quick response to concerning actions

3. **DelayModule**:
   - Enforces delay periods
   - Checks veto status
   - Ensures time for community review
   - Prevents rushed changes

### Director Role
The Director—owner of the Agent's governance contracts and Wallet—has operational control:
1. **Initial Control**
   - Exclusive proposal rights at deployment
   - Control over governance parameters
   - VetoContract Director role
   - Protocol parameter management
   - Control over Agent's code repository visibility
   - Control over fund release logic

2. **Configuration Capabilities**
   - Update protocol parameters
   - Set governance contract
   - Update protocol addresses
   - Configure proposal rights
   - Update governance parameters
   - Define fund release mechanisms

### Token Holder Rights
1. **Standard Veto Actions**
   - Voting Period: 72 hours
   - Quorum: 10% of total token supply
   - Threshold: >50% of votes in favor
   - Delay Period: 24 hours
   - Use Case: Regular operational decisions

2. **Critical Changes**
   - Voting Period: 7 days
   - Quorum: 20% of total token supply
   - Threshold: >66% of votes in favor
   - Delay Period: 48 hours
   - Use Case: Director transfers, fundamental changes

### Progressive Decentralization
The governance system supports evolution through:

1. **Proposal Rights**
   - Can be opened to all token holders
   - Can implement minimum balance requirements
   - Can be granted to specific addresses

2. **Voting Parameters**
   - Adjustable voting delay
   - Configurable voting period
   - Modifiable proposal threshold
   - Adjustable quorum requirements

3. **Role Transfers**
   - Director role can transfer to:
     - Multi-sig wallet
     - DAO
     - Other governance mechanism
   - Governance contract can be upgraded

### Implementation Mechanisms
1. **Parameter Updates**
   - `updateGovernanceParameters`: Modify voting settings
   - `updateProposalRights`: Change proposal access
   - `setProposerRights`: Manage individual rights

2. **Contract Upgrades**
   - UUPS upgradeable pattern
   - Can implement new governance models
   - Can add custom voting strategies

## Governance Risks

### Potential Gridlock Scenarios
1. **Quorum Failures**
   - Large token holder inactivity could prevent reaching quorum
   - Particularly risky for critical changes requiring 20% quorum
   - Can block necessary upgrades or improvements
   - Mitigation: Active community engagement and delegation

2. **Competing Interests**
   - Director proposing changes vs token holders vetoing
   - Could lead to operational paralysis
   - May prevent timely responses to opportunities/threats
   - Mitigation: Clear communication and compromise

3. **Time-Critical Situations**
   - Mandatory delay periods could block urgent actions
   - 24-48 hour delays might miss market opportunities
   - No bypass mechanism for emergencies
   - Mitigation: Proper planning and preventive measures

4. **Token Distribution Impact**
   - Concentrated token holdings could control vetoes
   - Fragmented holdings might struggle to reach quorum
   - Whale influence on critical decisions
   - Mitigation: Balanced token distribution and anti-whale measures 