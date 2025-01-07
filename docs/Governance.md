# AICO Protocol Governance

## Overview
The AICO Protocol implements a flexible governance system that can evolve from centralized to decentralized control, with built-in security mechanisms and configurable proposal rights. All governance capabilities described in this document are active immediately upon token deployment and remain unchanged throughout the token's lifecycle, including both before and after graduation to Uniswap. The market graduation process only affects the trading mechanism (from bonding curve to Uniswap pool) and does not impact any governance capabilities.

## Governance Structure

### Token Creator Powers
1. **Initial Control** (Active at all market stages):
   - Exclusive proposal rights at deployment
   - Control over governance parameters
   - VetoContract Director role
   - Protocol parameter management
   - These powers are independent of market type (bonding curve or Uniswap)

2. **Configuration Capabilities**:
   - Update protocol parameters via `upgradeParameters`
   - Set governance contract via `setGovernanceContract`
   - Update protocol addresses
   - Configure proposal rights
   - Update governance parameters (voting delay, period, threshold)

### Proposal Rights System

1. **Initial State**:
   - Token creator has exclusive proposal rights
   - Other addresses cannot create proposals
   - Proposals are closed by default

2. **Flexible Configuration**:
   - Token creator can open proposals to all token holders via `updateProposalRights`
   - Can set minimum token balance requirement for proposals
   - Can grant/revoke proposal rights to specific addresses via `setProposerRights`

3. **Access Control Modes**:
   - Exclusive Mode: Only explicitly authorized addresses can propose
   - Open Mode with Balance Requirement: Any address with sufficient tokens can propose
   - Fully Open Mode: Any token holder can propose

### Director Role
The VetoContract Director:
- Initially set to token creator
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
- Token creator maintains full control over governance parameters
- Token holders can participate in voting if granted proposal rights
- VetoContract and DelayModule are operational

### Uniswap Pool Stage
- Graduation to Uniswap does not affect governance capabilities
- All governance mechanisms remain unchanged
- Token creator retains same level of control
- Token holders maintain their existing voting rights
- VetoContract and DelayModule continue to function as before

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
1. Initial centralized state (token creator control)
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