# Based Agents Testing Plan

## Overview
This document outlines the comprehensive testing plan for the Based Agents protocol. Each test case includes specific steps, expected outcomes, and verification methods.

## Core Contract Testing

### AICO Token Contract

#### Token Creation & Configuration
- [ ] Initial supply minting (1B tokens)
  - Deploy contract with 1B initial supply
  - Verify totalSupply() returns 1,000,000,000 * 10^18
  - Verify balanceOf(deployer) equals initial supply
  - Check supply precision to 18 decimal places

- [ ] Token name and symbol setting
  - Verify name() returns "Based Agents Governance"
  - Verify symbol() returns "BAG"
  - Test immutability of name and symbol
  - Verify correct display in block explorers

- [ ] Decimals configuration
  - Verify decimals() returns 18
  - Test token transfers with decimal amounts
  - Verify precision handling in all operations
  - Test interaction with external contracts expecting ERC20 decimals

- [ ] Token URI setting
  - Set tokenURI with valid IPFS hash
  - Verify URI retrieval matches input
  - Test URI update restrictions
  - Validate URI format compliance

- [ ] Agent wallet initialization
  - Verify agent wallet address is correctly set
  - Test permissions on agent wallet functions
  - Verify agent wallet can receive tokens
  - Test agent wallet integration with governance

- [ ] Supply distribution verification
  - Verify primary market allocation (500M)
    - Check exact amount: 500,000,000 * 10^18
    - Verify tokens are locked in bonding curve contract
  - Verify secondary market allocation (200M)
    - Check exact amount: 200,000,000 * 10^18
    - Verify tokens are properly reserved
  - Verify agent allocation (300M)
    - Check exact amount: 300,000,000 * 10^18
    - Verify tokens are in agent wallet

#### Market Phases

##### Primary Market (Bonding Curve)
- [ ] Initial price verification
  - Test buy with 1 BAG at launch
  - Verify received tokens match initial price
  - Test multiple purchase sizes
  - Verify price calculation precision

- [ ] Price curve calculation accuracy
  - Test price at 0% sold
  - Test price at 25% sold
  - Test price at 50% sold
  - Test price at 75% sold
  - Test price at 99% sold
  - Verify continuous price function
  - Test for rounding errors
  - Verify gas costs at different points

- [ ] Maximum supply enforcement
  - Attempt to purchase beyond 500M limit
  - Test purchase exactly at limit
  - Test purchase slightly below limit
  - Verify error messages
  - Check remaining supply calculation

- [ ] Minimum order size enforcement
  - Test purchase below minimum (should fail)
  - Test purchase at exact minimum
  - Test purchase slightly above minimum
  - Verify error messages
  - Check gas costs for failed transactions

- [ ] Token minting during purchases
  - Track total supply before and after purchase
  - Verify buyer balance increase
  - Check minting event emissions
  - Verify minting restrictions

- [ ] BAG token collection
  - Verify BAG token transfer to treasury
  - Check BAG token transfer events
  - Verify balance updates
  - Test failed transfer handling

- [ ] Fee distribution accuracy
  - Purchase tokens with known amount
  - Verify creator fee (50% of 1%)
  - Verify treasury fee (25% of 1%)
  - Verify platform referrer fee (10% of 1%)
  - Verify order referrer fee (15% of 1%)
  - Test with missing referrers
  - Check rounding precision
  - Verify event emissions

##### Market Graduation
- [ ] 42,000 BAG accumulation trigger
  - Accumulate 41,999 BAG (should not trigger)
  - Add 1 BAG to reach threshold
  - Verify graduation event
  - Test multiple purchases crossing threshold
  - Check state changes

- [ ] 525 BAG graduation fee collection
  - Verify fee collection on graduation
  - Check fee transfer to treasury
  - Verify event emission
  - Test insufficient balance scenarios

- [ ] Uniswap pool creation
  - Verify pool creation transaction
  - Check initial liquidity amounts
  - Verify pool parameters
  - Test pool functionality
  - Check permissions

- [ ] Initial liquidity provision
  - Verify token amounts provided
  - Check BAG token amounts provided
  - Verify LP token receipt
  - Test liquidity lock period
  - Check ownership of LP tokens

- [ ] Market type transition
  - Verify state change from primary to secondary
  - Test primary market functions (should fail)
  - Verify secondary market activation
  - Check event emissions
  - Test transition irreversibility

##### Secondary Market
- [ ] Uniswap trading functionality
  - Test buy orders
  - Test sell orders
  - Verify price impact
  - Check slippage protection
  - Test limit orders
  - Verify trading volume tracking

- [ ] Supply limit enforcement
  - Test minting beyond limit
  - Verify total supply caps
  - Check supply tracking accuracy
  - Test burn impact on supply

- [ ] Fee collection and distribution
  - Execute trades with known amounts
  - Verify fee calculations
  - Check distribution to all parties
  - Test complex scenarios with referrers
  - Verify automatic treasury allocation

#### Fee System

##### Creation Fee (100 BAG)
- [ ] Collection on deployment
  - Deploy new token with insufficient BAG
  - Deploy with exact BAG amount
  - Deploy with excess BAG
  - Verify fee transfer events
  - Check deployer balance updates

- [ ] Transfer to treasury
  - Verify treasury receives 100 BAG
  - Check transfer event emission
  - Verify treasury balance update
  - Test failed transfer handling

##### Transaction Fees (1%)
- [ ] Token Creator (50% of fee)
  - Execute transaction with known amount
  - Verify creator receives 0.5% of transaction
  - Check multiple transaction sizes
  - Verify rounding behavior
  - Test fee accumulation

- [ ] Protocol Treasury (25% of fee)
  - Execute transaction with known amount
  - Verify treasury receives 0.25% of transaction
  - Test with various transaction sizes
  - Check fee accumulation over time

- [ ] Platform Referrer (10% of fee)
  - Set platform referrer
  - Execute transaction
  - Verify referrer receives 0.1% of transaction
  - Test referrer address changes
  - Check missing referrer scenarios

- [ ] Order Referrer (15% of fee)
  - Set order referrer
  - Execute transaction
  - Verify referrer receives 0.15% of transaction
  - Test multiple referrers
  - Check referrer validation

### Governance System

#### AICOGovernor Contract

##### Initialization
- [ ] Voting delay setting
  - Verify initial delay setting (1 day)
  - Test delay modification restrictions
  - Check delay enforcement
  - Verify event emissions

- [ ] Voting period setting
  - Verify initial period setting (1 week)
  - Test period modification restrictions
  - Check period enforcement
  - Test period boundaries

- [ ] Proposal threshold setting
  - Verify minimum tokens required (1%)
  - Test proposal creation below threshold
  - Test at exact threshold
  - Test above threshold

- [ ] Quorum requirement setting
  - Verify initial quorum setting (4%)
  - Test vote counting against quorum
  - Check quorum calculation accuracy
  - Test quorum updates

##### Proposal Creation
- [ ] Creator-only initial restrictions
  - Test proposal from non-creator (should fail)
  - Test creator proposal
  - Verify restriction period
  - Test restriction removal conditions

- [ ] Minimum token requirements
  - Test proposal with insufficient tokens
  - Test with exact minimum
  - Test with above minimum
  - Verify token lock during proposal

- [ ] Proposal formatting
  - Test invalid proposal format
  - Verify description requirements
  - Check transaction data format
  - Test multiple action proposals

- [ ] Event emissions
  - Verify ProposalCreated event
  - Check event parameter accuracy
  - Test event indexing
  - Verify event ordering

##### Voting Mechanics
- [ ] Vote casting
  - Test vote with no tokens
  - Test vote with tokens
  - Verify vote weight calculation
  - Test vote changes
  - Check double voting prevention

- [ ] Vote counting
  - Test for votes
  - Test against votes
  - Test abstain votes
  - Verify weighted voting
  - Check vote tallying accuracy

- [ ] Quorum calculation
  - Test below quorum
  - Test at exact quorum
  - Test above quorum
  - Verify quorum maintenance

- [ ] Result determination
  - Test proposal success conditions
  - Test proposal failure conditions
  - Verify tie handling
  - Check result finalization

- [ ] Timelock enforcement
  - Verify execution delay
  - Test early execution attempt
  - Test late execution
  - Check cancellation impact

#### VetoContract

##### Initialization
- [ ] Director role assignment
  - Verify initial director setting
  - Test director transfer
  - Check director permissions
  - Verify event emissions

- [ ] Veto rights configuration
  - Test veto permission setup
  - Verify veto token requirements
  - Check veto period settings
  - Test veto threshold configuration

##### Veto Process
- [ ] 72-hour voting period
  - Start veto vote
  - Test voting before period ends
  - Test voting at period end
  - Test voting after period
  - Verify period accuracy

- [ ] 10% quorum requirement
  - Test below quorum scenarios
  - Test exact quorum achievement
  - Verify quorum calculation
  - Test quorum maintenance

- [ ] >50% threshold verification
  - Test below threshold votes
  - Test exact threshold votes
  - Test above threshold votes
  - Verify threshold calculation

- [ ] 24-hour delay period
  - Test execution before delay
  - Verify delay period start
  - Test execution after delay
  - Check delay period accuracy

- [ ] Veto execution
  - Test successful veto
  - Verify transaction cancellation
  - Check state updates
  - Test failed veto impact

#### DelayModule

##### Delay Periods
- [ ] Standard 24-hour delay
  - Queue standard transaction
  - Test execution before delay
  - Test at exact delay time
  - Verify delay enforcement

- [ ] Critical 48-hour delay
  - Queue critical transaction
  - Test execution before delay
  - Test at exact delay time
  - Verify extended delay

- [ ] Bypass prevention
  - Test direct execution attempts
  - Verify delay enforcement
  - Check permission requirements
  - Test emergency scenarios

##### Transaction Management
- [ ] Proposal queueing
  - Queue valid proposal
  - Test invalid proposal queueing
  - Verify queue order
  - Check queue limitations

- [ ] Execution timing
  - Test early execution
  - Test on-time execution
  - Test late execution
  - Verify timestamp accuracy

- [ ] Veto checking
  - Queue transaction
  - Apply veto
  - Verify execution blocking
  - Test veto removal impact

### Factory Contract

#### Deployment
- [ ] Token deployment
  - Deploy with valid parameters
  - Test invalid parameter handling
  - Verify contract initialization
  - Check deployment events

- [ ] Governor deployment
  - Deploy with token address
  - Verify governor initialization
  - Test permission setup
  - Check integration points

- [ ] Fee handling
  - Verify creation fee collection
  - Test fee transfer accuracy
  - Check event emissions
  - Verify treasury receipt

## Integration Testing

### Token-Governor Integration
- [ ] Voting power calculation
  - Buy tokens
  - Verify voting power update
  - Test delegation impact
  - Check historical power

- [ ] Proposal creation rights
  - Test creator permissions
  - Verify token threshold checks
  - Test permission transitions
  - Check restriction periods

### Veto-Delay Integration
- [ ] Delay period enforcement
  - Queue transaction
  - Start veto process
  - Verify delay extension
  - Test execution conditions

### Factory-Token Integration
- [ ] Deployment coordination
  - Deploy new token
  - Verify governor setup
  - Check permission links
  - Test initial state

## Security Testing

### Access Control
- [ ] Owner functions
  - Test each restricted function
  - Verify permission checks
  - Test ownership transfers
  - Check role separation

### Economic Security
- [ ] Bonding curve manipulation
  - Test large purchases
  - Check price impact
  - Verify curve integrity
  - Test arbitrage resistance

## Edge Cases

### Token Operations
- [ ] Zero value transfers
  - Test zero transfer handling
  - Verify event emissions
  - Check gas costs
  - Test approval behavior

### Governance Operations
- [ ] Empty proposals
  - Submit empty proposal
  - Test voting process
  - Verify execution handling
  - Check state updates

## Performance Testing

### Gas Optimization
- [ ] Token transfers
  - Measure simple transfer gas
  - Test batch transfer gas
  - Compare to standards
  - Identify optimizations

## Documentation Verification

### Technical Documentation
- [ ] Function documentation
  - Verify parameter descriptions
  - Check return values
  - Test example accuracy
  - Verify error cases

## Post-Deployment Verification

### Network Verification
- [ ] Contract addresses
  - Verify all contract addresses
  - Check contract bytecode
  - Verify proxy implementations
  - Test contract interactions 