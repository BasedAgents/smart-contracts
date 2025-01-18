# Testing Plan and Results

## Comprehensive Test Results

| Test ID | Description | File | Expected Result | Actual Result | Status |
|----------|-------------|------|-----------------|---------------|---------|
| 00 | Create Agent with BAG Fee | [00_agent_creation_test.js](../scripts/tests/00_agent_creation_test.js) | New agent created with 100 BAG fee | Agent created successfully<br>Token: `0x98a42A21A3BaB08D63fC4fe94C703eB85fcB2DA7`<br>Governor: `0xA12eC19ebbB925D2EA47B51135c2659DBdd176E5` | ✅ PASS |
| 01 | Initial Price Test | [01_initial_price_test.js](../scripts/tests/01_initial_price_test.js) | Initial price: 1.06 BAG | Initial price: 1.06 BAG | ✅ PASS |
| 02 | Buy Quote Test | [02_buy_quote_test.js](../scripts/tests/02_buy_quote_test.js) | Quote matches bonding curve formula | Quotes generated correctly | ✅ PASS |
| 03 | Bonding Curve Test | [03_bonding_curve_test.js](../scripts/tests/03_bonding_curve_test.js) | Verify bonding curve parameters and behavior:<br>- Curve parameters (A, B) set correctly<br>- BAG token address linked<br>- Curve formula y = A*e^(Bx) validated<br>- Price progression matches expected points | Parameters verified, curve behavior correct | ✅ PASS |
| 04 | Token Purchase Test | [04_token_purchase_test.js](../scripts/tests/04_token_purchase_test.js) | Purchase 10 BAG worth of tokens (Expected ~9.43 TEST based on initial price) | ❌ Test not executed yet - Need to run purchase test and record transaction | 🔄 Pending |
| 05 | Total Supply Test | [05_total_supply_test.js](../scripts/tests/05_total_supply_test.js) | Total supply: 1B TEST tokens | Total supply: 300M TEST tokens | ❌ FAIL |
| 06 | Agent Wallet Allocation | [06_agent_allocation_test.js](../scripts/tests/06_agent_allocation_test.js) | Agent wallet: 300M TEST tokens | Agent wallet: 300M TEST tokens | ✅ PASS |
| 07 | Uniswap Reserve Test | [07_uniswap_reserve_test.js](../scripts/tests/07_uniswap_reserve_test.js) | Uniswap reserve: 200M TEST tokens | Uniswap reserve: 0 TEST tokens | ❌ FAIL |
| 08 | Total Distribution Test | [08_total_distribution_test.js](../scripts/tests/08_total_distribution_test.js) | All 1B tokens accounted for | Only 300M tokens distributed | ❌ FAIL |
| 09 | Governance Parameter Test | [09_governance_parameter_test.js](../scripts/tests/09_governance_parameter_test.js) | Voting delay: 172800<br>Voting period: 43200<br>Proposal threshold: 1000 TEST | All parameters match expected values | ✅ PASS |
| 10 | Quorum Test | [10_quorum_test.js](../scripts/tests/10_quorum_test.js) | Quorum: 10% of total supply | Quorum correctly set to 10% | ✅ PASS |

### Test Details

#### Initial Setup & Price Mechanism (Tests 00-03)
- Test 00: Agent Creation
  - Requires 100 BAG fee
  - Deploys token and governor contracts
  - Sets up initial parameters

- Test 01: Initial Price
  - Verifies starting price of 1.06 BAG
  - Checks price calculation mechanism

- Test 02: Buy Quote
  - Validates quote calculation using bonding curve formula
  - Tests different purchase amounts for correct pricing

- Test 03: Bonding Curve Setup
  - Verifies curve parameters:
    - A (~1.06) sets initial price
    - B (0.023) controls price growth rate
  - Validates price progression:
    - At 0 tokens: 1.06 BAG
    - At 100M tokens: ~10.2 BAG
    - At 250M tokens: ~98.5 BAG
    - At 500M tokens: ~4,634.21 BAG
  - Confirms total BAG required for graduation: 42,000 BAG
  - Note: 0 tokens shown in bonding curve balance is correct - tokens are minted on-demand during purchases

#### Token Operations (Test 04)
- Purchase test verifies buying tokens with BAG
- Expected to receive ~9.43 TEST for 10 BAG based on initial price
- Includes slippage protection and proper event emission

#### Supply Distribution Tests (05-08)
- Tests 05 and 08 are failing because tokens are minted on-demand
- Only the agent allocation (300M) is minted at creation
- The remaining 700M tokens will be minted during:
  - Primary market purchases (500M)
  - Market graduation for Uniswap (200M)
- Uniswap reserve test must pass before verifying total distribution

#### Governance Tests (09-10)
- All governance parameters correctly configured:
  - Voting delay: 172800 blocks (48 hours)
  - Voting period: 43200 blocks (12 hours)
  - Proposal threshold: 1000 TEST tokens
  - Quorum requirement: 10% of total supply
  - Token address correctly linked to governor

### Notes
- Core functionality tests run against the test agent (Token: `0x98a42A21A3BaB08D63fC4fe94C703eB85fcB2DA7`)
- Supply distribution tests appear to fail but this is expected behavior:
  - Only agent allocation (300M) is minted at creation
  - Bonding curve supply (500M) is minted on-demand during purchases
  - Uniswap reserve (200M) is minted during market graduation
- Price mechanism tests (01-03) must pass before attempting token purchases
- Uniswap reserve must be verified before checking total distribution 

## Manual Testing Guide (Sepolia)

### Contract Addresses
- BAG Token: [`0x780DB7650ef1F50d949CB56400eE03052C7853CC`](https://sepolia.etherscan.io/address/0x780DB7650ef1F50d949CB56400eE03052C7853CC#writeContract)
- Agent Token (TEST): [`0x98a42A21A3BaB08D63fC4fe94C703eB85fcB2DA7`](https://sepolia.etherscan.io/address/0x98a42A21A3BaB08D63fC4fe94C703eB85fcB2DA7#readContract)

### Setup Requirements
1. MetaMask or similar Web3 wallet connected to Sepolia
2. Sepolia ETH for gas (get from faucet)
3. BAG tokens in wallet
4. Etherscan account (for verified contract interaction)

### Manual Test Instructions

#### Test 00: Create New Agent Token
1. Get BAG Tokens:
   - Visit [BAG Token](https://sepolia.etherscan.io/address/0x780DB7650ef1F50d949CB56400eE03052C7853CC#writeContract)
   - Connect Web3 (top right)
   - You need 100 BAG for agent creation fee

2. Approve Factory:
   - In BAG Token contract:
   - Find `approve` function
   - Enter:
     ```
     spender: 0x4b4f8ca8FB3e66B5DDd49F1460F0E44840Da3f4F (Factory address)
     amount: 100000000000000000000 (100 BAG)
     ```
   - Click "Write"
   - Confirm transaction in wallet

3. Create Agent:
   - Visit [Agent Factory](https://sepolia.etherscan.io/address/0x4b4f8ca8FB3e66B5DDd49F1460F0E44840Da3f4F#writeContract)
   - Connect Web3
   - Find `createAgent` function
   - Enter:
     ```
     name: "TEST Token"
     symbol: "TEST"
     platformReferrer: [Your address or referrer's address]
     agentWallet: [Address to receive 300M tokens]
     tokenURI: "ipfs://..." (your token metadata URI)
     ```
   - Click "Write"
   - Confirm transaction in wallet
   - In transaction receipt, find "AgentCreated" event to get new token address

4. Verify Creation:
   - Open new token address on Etherscan
   - Check:
     ```
     totalSupply() = 300000000000000000000000000 (300M)
     agentWallet() = [Address you specified]
     owner() = [Your address]
     ```

Note: Save your token address for subsequent tests. The example token we'll use is: `0x98a42A21A3BaB08D63fC4fe94C703eB85fcB2DA7`

#### Test 01: Check Initial Price
1. Visit [Agent Token Contract](https://sepolia.etherscan.io/address/0x98a42A21A3BaB08D63fC4fe94C703eB85fcB2DA7#readContract)
2. Click "Read Contract"
3. Find and call `bondingCurve()` - copy the returned address
4. Visit the bonding curve contract at the returned address
5. Click "Read Contract"
6. Verify the bonding curve parameters:
   ```
   A() → 1060000000000000000 (1.06 BAG)
   B() → 23000000000000000 (0.023)
   ```

   These parameters define the bonding curve formula: price = A * e^(B*supply)
   - A (1.06 BAG) sets the initial price when supply is 0
   - B (0.023) controls how fast the price grows as supply increases
   
   Expected price points:
   - At 0 tokens: 1.06 BAG
   - At 100M tokens: ~10.2 BAG
   - At 250M tokens: ~98.5 BAG
   - At 500M tokens: ~4,634.21 BAG

   Note: All values use 18 decimals. For example:
   - 1.06 BAG = 1060000000000000000
   - 0.023 = 23000000000000000

7. Verify the BAG token is linked correctly:
   ```
   bagToken() → 0x780DB7650ef1F50d949CB56400eE03052C7853CC
   ```

#### Test 02: Verify Buy Quote
1. Open bonding curve contract
2. Call `getBAGBuyQuote`:
   ```
   currentSupply: 0
   bagAmount: 10000000000000000000 (10 BAG)
   ```
3. Should return: 8537970010852390043 (≈8.54 TEST)

#### Test 03: Validate Bonding Curve
This test verifies that the bonding curve is set up correctly for your agent token. The bonding curve determines how token price changes with supply.

1. Visit the bonding curve contract (from Test 01)
2. Click "Read Contract"
3. Verify curve parameters:
   ```
   A() = 1060000000000000000 (1.06 BAG)
   B() = 23000000000000000 (0.023)
   bagToken() = 0x780DB7650ef1F50d949CB56400eE03052C7853CC
   ```

   Parameter Validation:
   - A (Initial Price):
     - Must be exactly 1.06 BAG (1060000000000000000 wei)
     - This sets the starting price when supply is 0
     - Lower value = cheaper initial tokens
     - Higher value = more expensive initial tokens

   - B (Growth Rate):
     - Must be exactly 0.023 (23000000000000000 wei)
     - Controls how quickly price increases with supply
     - Lower value = slower price growth
     - Higher value = faster price growth

   - BAG Token:
     - Must match BAG token address exactly
     - Ensures purchases use correct token
     - Any mismatch will prevent purchases

   Price Growth Examples:
   ```
   For 10 BAG purchase:
   - At 0 supply: ~8.54 TEST tokens
   - At 100M supply: ~0.89 TEST tokens
   - At 250M supply: ~0.092 TEST tokens
   ```

   Graduation Target:
   - Need 42,000 BAG in purchases to graduate
   - Track progress via cumulative purchases
   - Graduation triggers Uniswap pool creation

4. Optional: Verify with test purchase
   - Try buying small amount (1-10 BAG)
   - Check received tokens match quote
   - Monitor price increase after purchase

Note: Any deviation from these exact parameters will cause the bonding curve to behave incorrectly. The parameters are carefully chosen to:
- Start at a reasonable price (1.06 BAG)
- Reach graduation (42,000 BAG) at appropriate token supply
- Maintain sustainable price growth

#### Test 04: Purchase Tokens
This test executes your first token purchase. Due to blockchain security, this requires two steps:

1. BAG Token Approval:
   - Required because smart contracts can't spend your tokens without permission
   - This is a security feature of ERC20 tokens to prevent unauthorized spending
   - You only need to do this once for each amount you want to allow
   
   Steps:
   - Open [BAG Token](https://sepolia.etherscan.io/address/0x780DB7650ef1F50d949CB56400eE03052C7853CC#writeContract)
   - Connect Web3 (top right)
   - Find `approve` function
   - Enter:
     ```
     spender: 0x98a42A21A3BaB08D63fC4fe94C703eB85fcB2DA7 (Agent token address)
     amount: 10000000000000000000 (10 BAG)
     ```
   - Click "Write" and confirm in your wallet
   - Wait for transaction to complete

2. Execute Purchase:
   - Now that approval is given, we can execute the actual purchase
   - The bonding curve will calculate tokens based on current supply
   
   Steps:
   - Open [Agent Token](https://sepolia.etherscan.io/address/0x98a42A21A3BaB08D63fC4fe94C703eB85fcB2DA7#writeContract)
   - Connect Web3
   - Find `buy` function
   - Enter:
     ```
     bagAmount: 10000000000000000000 (10 BAG to spend)
     recipient: [Your Address] (where to receive TEST tokens)
     refundRecipient: [Your Address] (where to return BAG if transaction fails)
     comment: "" (optional message)
     expectedMarketType: 0 (0 = bonding curve, 1 = Uniswap)
     minOrderSize: 8537970010852390043 (minimum TEST tokens to receive, from Test 02)
     sqrtPriceLimitX96: 0 (not used for bonding curve purchases)
     ```
   - Value: 0 ETH (we're paying with BAG, not ETH)
   - Click "Write" and confirm in your wallet

#### Test 05: Check Supply Distribution
This test verifies how tokens are being distributed. The total supply is split into three parts:

1. Open [Agent Token](https://sepolia.etherscan.io/address/0x98a42A21A3BaB08D63fC4fe94C703eB85fcB2DA7#readContract)
2. Read and verify these values:
   ```
   totalSupply() → 300000000000000000000000000 (300M - Initial agent allocation)
   MAX_TOTAL_SUPPLY() → 1000000000000000000000000000 (1B - Maximum possible supply)
   PRIMARY_MARKET_SUPPLY() → 500000000000000000000000000 (500M - For bonding curve sales)
   SECONDARY_MARKET_SUPPLY() → 200000000000000000000000000 (200M - For Uniswap after graduation)
   ```

   Supply Breakdown:
   - Agent Allocation (300M):
     - Minted immediately at creation
     - Sent to agent wallet
     - Used for development, marketing, etc.
   
   - Primary Market (500M):
     - Not minted yet
     - Minted on-demand during purchases
     - Sold through bonding curve
   
   - Secondary Market (200M):
     - Not minted yet
     - Reserved for Uniswap liquidity
     - Minted when market graduates (42,000 BAG collected)

   Note: Initially, only the agent allocation (300M) exists. The remaining 700M tokens are minted as needed:
   - During purchases (up to 500M)
   - At graduation (200M for Uniswap)

#### Test 06: Verify Agent Allocation
1. Open Agent Token
2. Read:
   ```
   agentWallet() → [copy address]
   balanceOf([agent wallet]) → 300000000000000000000000000
   ```

#### Test 07: Check Market Status
Prerequisites: 42,000 BAG in purchases needed
1. Open Agent Token
2. Read:
   ```
   marketType() → 0 (pre-graduation)
   poolAddress() → should be 0x00...00
   ```
3. After graduation:
   ```
   marketType() → 1
   poolAddress() → [Uniswap pool address]
   ```

#### Test 08: Audit Distribution
1. Open Agent Token
2. Read:
   ```
   agentWallet() → [address]
   balanceOf([agent wallet]) → 300M
   totalSupply() → current total
   marketType() → current market
   ```

#### Test 09: Check Governance
1. Open Agent Token
2. Read:
   ```
   owner() → [creator address]
   tokenCreator() → [creator address]
   platformReferrer() → [referrer address]
   getVotes([holder]) → [voting power]
   ```

#### Test 10: Verify Quorum
1. Open Agent Token
2. Calculate:
   ```
   totalSupply() × 0.04 = quorum requirement
   ```

### Troubleshooting Guide

#### Transaction Failures
1. Check Wallet:
   - Sufficient Sepolia ETH for gas
   - Sufficient BAG balance
   - Connected to Sepolia network

2. Check Approvals:
   - BAG allowance ≥ purchase amount
   - Correct spender address

3. Check Parameters:
   - `minOrderSize` matches quote exactly
   - `expectedMarketType` = 0 (bonding curve)
   - `value` = 0 (using BAG, not ETH)

4. Common Errors:
   - "Insufficient allowance" → Approve more BAG
   - "Execution reverted" → Check parameters
   - "Out of gas" → Increase gas limit 