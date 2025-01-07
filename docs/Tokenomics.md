# AICO Protocol Tokenomics

## Transaction Fees

### Base Fee
- Total Fee: 1% (100 BPS) of each transaction
  - Mutable: Yes, via `upgradeParameters`
  - Controller: AICO token owner
  - Parameter: `TOTAL_FEE_BPS`
- Minimum Order Size: 0.0000001 BAG
  - Mutable: Yes, via `upgradeParameters`
  - Controller: AICO token owner
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
  - Mutable: Yes, via `upgradeParameters`
  - Controller: AICO token owner
  - Parameter: `graduationFee`
- Distribution: Same as transaction fees
- Timing: One-time fee at market graduation

## Supply Parameters
All supply parameters mutable via `upgradeParameters` by AICO token owner:
- Maximum Total Supply: 1,000,000,000 tokens (`MAX_TOTAL_SUPPLY`)
- Primary Market Supply: 800,000,000 tokens (`PRIMARY_MARKET_SUPPLY`)
- Secondary Market Supply: 200,000,000 tokens (`SECONDARY_MARKET_SUPPLY`)

## Bonding Curve Parameters
Bonding curve uses formula `y = A*e^(Bx)` where:
- A = 1.06 BAG (initial price coefficient)
  - Immutable after deployment
  - Set in BondingCurve contract constructor
- B = 0.015 (exponential growth rate)
  - Immutable after deployment
  - Set in BondingCurve contract constructor

Price progression (determined by immutable A and B parameters):
- Initial price: 1.06 BAG
- At 100M tokens: ~4.24 BAG
- At 400M tokens: ~68.12 BAG
- At 800M tokens: ~4,634.21 BAG
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
1. AICO token owner calls `upgradeParameters` function
2. Function validates new parameters
3. Updates take effect immediately
4. Events emitted:
   - `TokenParametersUpdated` for supply changes
   - `GraduationFeeUpdated` for graduation fee changes 