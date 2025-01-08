# AICO Protocol Governance

## Overview
The AICO Protocol implements a flexible governance system that can evolve from centralized to decentralized control, with built-in security mechanisms and configurable proposal rights. All governance capabilities described in this document are active immediately upon token deployment and remain unchanged throughout the token's lifecycle, including both before and after graduation to Uniswap. The market graduation process only affects the trading mechanism (from bonding curve to Uniswap pool) and does not impact any governance capabilities.

## Governance Architecture

### Contract Structure
The governance system consists of three main contracts working together:

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

### Voting Parameters

1. **Standard Veto Actions** (Through VetoContract):
   - Voting Period: 72 hours
   - Quorum: 10% of total token supply
   - Threshold: >50% of votes in favor
   - Delay Period: 24 hours
   - Use Case: Regular operational decisions

2. **Critical System Changes** (Through AICOGovernor):
   - Voting Period: 7 days
   - Quorum: 20% of total token supply
   - Threshold: >66% of votes in favor
   - Delay Period: 48 hours
   - Use Case: Director transfers, fundamental changes

## Governance Risks

### Potential Gridlock Scenarios

1. **Quorum Failures**:
   - Large token holder inactivity could prevent reaching quorum
   - Particularly risky for critical changes requiring 20% quorum
   - Can block necessary upgrades or improvements
   - Mitigation: Active community engagement and delegation

2. **Competing Interests**:
   - Director proposing changes vs token holders vetoing
   - Could lead to operational paralysis
   - May prevent timely responses to opportunities/threats
   - Mitigation: Clear communication and compromise

3. **Time-Critical Situations**:
   - Mandatory delay periods could block urgent actions
   - 24-48 hour delays might miss market opportunities
   - No bypass mechanism for emergencies
   - Mitigation: Proper planning and preventive measures

4. **Token Distribution Impact**:
   - Concentrated token holdings could control vetoes
   - Fragmented holdings might struggle to reach quorum
   - Whale influence on critical decisions
   - Mitigation: Balanced token distribution and anti-whale measures

## Governance Structure

### Agent Creator Powers
1. **Initial Control** (Active at all market stages):
   - Exclusive proposal rights at deployment
   - Control over governance parameters
   - VetoContract Director role
   - Protocol parameter management
   - Control over Agent's code repository visibility (public/private)
   - Control over fund release logic and mechanisms
   - These powers are independent of market type (bonding curve or Uniswap)

2. **Configuration Capabilities**:
   - Update protocol parameters via `upgradeParameters`
   - Set governance contract via `setGovernanceContract`
   - Update protocol addresses
   - Configure proposal rights
   - Update governance parameters (voting delay, period, threshold)
   - Define and modify fund release mechanisms
   - Manage code repository access and visibility

### Proposal Rights System

1. **Initial State**:
   - Agent creator has exclusive proposal rights
   - Other addresses cannot create proposals
   - Proposals are closed by default
   - Agent creator controls code visibility and fund release logic
   - Token holders have veto rights over changes

2. **Flexible Configuration**:
   - Agent creator can open proposals to all token holders via `updateProposalRights`
   - Can set minimum token balance requirement for proposals
   - Can grant/revoke proposal rights to specific addresses via `setProposerRights`
   - Can modify fund release mechanisms (subject to token holder veto)
   - Can change code repository visibility (subject to token holder veto)

3. **Access Control Modes**:
   - Exclusive Mode: Only explicitly authorized addresses can propose
   - Open Mode with Balance Requirement: Any address with sufficient tokens can propose
   - Fully Open Mode: Any token holder can propose
   - All modes maintain Director control over code and fund release logic
   - All modes include token holder veto rights

### Director Role
The VetoContract Director:
- Initially set to Agent creator
- Can veto proposed transactions during delay period
- Replaceable through token holder governance
- Acts as security backstop
- Separate from general governance voting

### Governance Contract
When set, the governance contract can:
- Update protocol parameters
- Update protocol addresses
- Implement additional governance logic

## Governance Evolution

### Transition Capabilities
1. **Proposal Rights**:
   - Can be opened to all token holders
   - Can implement minimum balance requirements
   - Can be granted to specific addresses

2. **Voting Parameters**:
   - Adjustable voting delay
   - Configurable voting period
   - Modifiable proposal threshold
   - Adjustable quorum requirements

3. **Role Transfers**:
   - Director role can transfer to:
     - Multi-sig wallet
     - DAO
     - Other governance mechanism
   - Governance contract can be upgraded

### Implementation Mechanisms
1. **Parameter Updates**:
   - `updateGovernanceParameters`: Modify voting settings
   - `updateProposalRights`: Change proposal access
   - `setProposerRights`: Manage individual rights

2. **Contract Upgrades**:
   - UUPS upgradeable pattern
   - Can implement new governance models
   - Can add custom voting strategies

## Market Stages and Governance

### Bonding Curve Stage
- All governance capabilities are fully active
- Agent creator maintains full control over:
  - Governance parameters
  - Code repository visibility
  - Fund release mechanisms
  - Operational decisions
- Token holders have veto rights over changes
- VetoContract and DelayModule are operational

### Uniswap Pool Stage
- Graduation to Uniswap does not affect governance capabilities
- All governance mechanisms remain unchanged
- Agent creator retains same level of control over:
  - Code repository visibility (public/private)
  - Fund release logic and mechanisms
  - Operational parameters
- Token holders maintain their veto rights
- VetoContract and DelayModule continue to function as before

### Code and Fund Management
1. **Code Repository Control**:
   - Director decides repository visibility (public/private)
   - Director manages code access and updates
   - Changes subject to token holder veto
   - Visibility status transparent to token holders

2. **Fund Release Mechanisms**:
   - Director designs and implements fund control logic
   - Can include automated rules or manual approvals
   - Changes subject to token holder veto
   - Mechanisms transparent to token holders

3. **Operational Control**:
   - Director maintains day-to-day operational control
   - Can implement automated processes
   - Can modify operational parameters
   - Subject to token holder veto rights

## Events and Monitoring

### Governance Events
1. **Proposal Rights**:
   - `ProposalRightsUpdated`: Configuration changes
   - `ProposerRightsUpdated`: Individual permission changes

2. **General Governance**:
   - `GovernanceContractUpdated`: Contract changes
   - Standard Governor events for proposals and voting

### Security Measures
1. **Time Locks**:
   - Voting delay period
   - Execution delay
   - Veto window

2. **Access Controls**:
   - Proposal rights management
   - Director veto power
   - Governance parameter protection

## Example Workflows

### Governance Transition
1. Initial centralized state (Agent creator control)
2. Grant proposal rights to key stakeholders
3. Enable minimum balance requirements
4. Open proposals to all qualified token holders
5. Transfer Director role to community governance

### Proposal Lifecycle
1. **Creation**:
   - Check proposal rights
   - Submit proposal details
   - Start voting delay

2. **Voting**:
   - Token holders cast votes
   - Track quorum progress
   - Monitor voting period

3. **Execution**:
   - Verify proposal passed
   - Check veto status
   - Execute approved actions 