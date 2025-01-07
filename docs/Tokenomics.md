# AICO Protocol Tokenomics

## Governance Control
Parameters can be modified through two authorized entities:
1. Token Creator (set as owner during token initialization)
   - This is the address that creates the token through the factory
   - Has full control over their specific AICO token instance
   - Can update parameters and set governance contract
2. Governance Contract (can be set/updated by token creator)
   - Separate contract that can be given parameter update rights
   - Set via `setGovernanceContract` by token creator
   - Can be updated or revoked by token creator

### Governance Setup
- Owner can set/update governance contract address via `setGovernanceContract`
- Both owner and governance contract can call parameter update functions
- Governance contract address cannot be zero address
- Changes tracked via `GovernanceContractUpdated` event

## Parameter Modification Rights

### Modifiable by Owner OR Governance Contract
The following parameters can be updated via `upgradeParameters`:
1. Supply Parameters:
   - Maximum Total Supply (`MAX_TOTAL_SUPPLY`)
   - Primary Market Supply (`PRIMARY_MARKET_SUPPLY`)
   - Secondary Market Supply (`SECONDARY_MARKET_SUPPLY`)

2. Fee Parameters:
   - Total Fee BPS (`TOTAL_FEE_BPS`)
   - Token Creator Fee BPS (`TOKEN_CREATOR_FEE_BPS`)
   - Protocol Fee BPS (`PROTOCOL_FEE_BPS`)
   - Platform Referrer Fee BPS (`PLATFORM_REFERRER_FEE_BPS`)
   - Order Referrer Fee BPS (`ORDER_REFERRER_FEE_BPS`)
   - Minimum Order Size (`MIN_ORDER_SIZE`)
   - Graduation Fee (`graduationFee`)

3. Protocol Addresses (via `updateProtocolAddresses`):
   - Protocol Fee Recipient
   - Protocol Rewards Contract
   - WETH Contract
   - Nonfungible Position Manager
   - Swap Router

### Modifiable by Owner Only
- Governance Contract Address (via `setGovernanceContract`)

## Protocol Fee Recipient
- Current Address: `0x973de1CDAce46ddF5904cF46cb96E6d039Ac75C2`
- Modifiable through governance upgrade
- Serves as:
  - Default recipient for protocol fees (20% of total fees)
  - Default recipient for platform referrer fees when no referrer specified
  - Default recipient for order referrer fees when no referrer specified

## Transaction Fees

### Base Fee
- Total Fee: 1% (100 BPS) of each transaction
  - Mutable: Yes, via governance
  - Parameter: `TOTAL_FEE_BPS`
- Minimum Order Size: 0.0000001 BAG
  - Mutable: Yes, via governance
  - Parameter: `MIN_ORDER_SIZE`

### Fee Distribution
Total fee is split among four parties (all percentages mutable by AICO token owner via `upgradeParameters`):

1. **Token Creator** (50% of total fee)
   - BPS Value: 5000
   - Parameter: `TOKEN_CREATOR_FEE_BPS`
   - Recipient: `tokenCreator` (immutable after AICO deployment)
   - Event ID: `AICO_CREATOR_FEE`

2. **Protocol** (20% of total fee)
   - BPS Value: 2000
   - Parameter: `PROTOCOL_FEE_BPS`
   - Recipient: `protocolFeeRecipient` (immutable after AICO deployment)
   - Event ID: `AICO_PROTOCOL_FEE`

3. **Platform Referrer** (15% of total fee)
   - BPS Value: 1500
   - Parameter: `PLATFORM_REFERRER_FEE_BPS`
   - Recipient: `platformReferrer` (immutable after AICO deployment)
   - Event ID: `AICO_PLATFORM_REFERRER_FEE`

4. **Order Referrer** (15% of total fee)
   - BPS Value: 1500
   - Parameter: `ORDER_REFERRER_FEE_BPS`
   - Recipient: Set per transaction, defaults to `protocolFeeRecipient`
   - Event ID: `AICO_ORDER_REFERRER_FEE`

## Market Graduation Fee
- Amount: 525 BAG
  - Mutable: Yes, via governance
  - Parameter: `graduationFee`
- Distribution: Same as transaction fees
- Timing: One-time fee at market graduation

## Supply Parameters
All supply parameters mutable via governance:
- Maximum Total Supply: 1,000,000,000 tokens (`MAX_TOTAL_SUPPLY`)
- Primary Market Supply: 500,000,000 tokens (`PRIMARY_MARKET_SUPPLY`)
- Secondary Market Supply: 200,000,000 tokens (`SECONDARY_MARKET_SUPPLY`)
- Agent Allocation: 300,000,000 tokens (`AGENT_ALLOCATION`)

## Bonding Curve Parameters
Bonding curve uses formula `y = A*e^(Bx)` where:
- A = 1.06 BAG (initial price coefficient)
  - Immutable after deployment
  - Set in BondingCurve contract constructor
- B = 0.023 (exponential growth rate)
  - Immutable after deployment
  - Set in BondingCurve contract constructor

Price progression (determined by immutable A and B parameters):
- Initial price: 1.06 BAG
- At 100M tokens: ~10.2 BAG
- At 250M tokens: ~98.5 BAG
- At 500M tokens: ~4,634.21 BAG
Total BAG required: 42,000 BAG

## Fee Management
- Collection: All fees processed through `_disperseFees` function
- Storage: Fees held in ProtocolRewards contract
- Modification: 
  - All BPS values can be updated by AICO token owner
  - Fee recipient addresses are immutable after deployment
  - Changes require `upgradeParameters` function call
- Events: All fee distributions tracked via `BagTokenFees` events

## Parameter Update Process
1. Governance proposal created
2. Community voting period
3. If approved:
   - For parameter updates: `upgradeParameters` function called
   - For contract upgrades: Upgrade process initiated
4. Events emitted:
   - `TokenParametersUpdated` for supply changes
   - `GraduationFeeUpdated` for graduation fee changes
   - Additional events for governance actions

## Governance Upgrade Process
The ability to modify these parameters can be transferred to:
1. Community multisig
2. BasedAgents DAO
3. Any future governance mechanism
through appropriate contract upgrades approved by token holders. 