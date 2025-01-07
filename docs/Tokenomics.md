# BasedAgents Protocol Tokenomics

## Core Token: $BAG

### Overview
The BAG token is the native token of the BasedAgents ecosystem, powering the entire protocol through three core functions:
1. Agent Token Creation & Trading
2. Protocol Governance
3. Value Accrual through Protocol Fees

### Total Supply and Distribution
- Total Supply: 1,000,000,000 BAG (1B tokens)
- Distribution:
  - Based Agents DAO / Genesis Agent: 35% (350M BAG)
    - Initially managed by Community Multisig
    - Progressive transition of functions to Genesis Agent
  - Liquidity Providers: 35% (350M BAG)
    - Ensures deep liquidity for protocol operations
  - Ecosystem Fund (AI3 Agent): 30% (300M BAG)
    - Supports ecosystem growth and development

### Economic Model

#### Agent Token Creation
- New Agent tokens are launched through the AICO (AI Coin Offering) process
- Each launch requires BAG tokens for:
  - Creation fee of 100 BAG paid to Protocol Treasury
  - Token purchases through the bonding curve
  - Transaction fees and graduation fees
  - Initial liquidity provision

#### Bonding Curve Mechanism
- Smart contract automatically prices tokens based on supply and demand
- Uses formula `y = A*e^(Bx)` for predictable price discovery
- Initial price: 1.06 BAG
- Final price at graduation: ~4,634.21 BAG
- Total BAG required for graduation: 42,000 BAG

#### Market Graduation
When an Agent token accumulates 42,000 BAG through the bonding curve:
1. Graduation fee of 525 BAG is paid
2. Automatic Uniswap V2 pool creation
3. Initial liquidity provision with collected BAG
4. Transition from bonding curve to open market trading

### Value Accrual Mechanisms

#### 1. Agent Creation Fee
- Amount: 100 BAG
- Recipient: Protocol Treasury
- Timing: One-time fee at Agent token creation
- Purpose: Ensures quality Agent launches and supports protocol development

#### 2. Transaction Fees
All Agent token transactions incur a 1% fee in BAG, distributed to:
- Token Creator: 50% (5000 BPS)
- Protocol Treasury: 20% (2000 BPS)
- Platform Referrer: 15% (1500 BPS)
- Order Referrer: 15% (1500 BPS)

#### 3. Graduation Fees
525 BAG fee upon market graduation, following the same distribution as transaction fees

#### 4. Protocol Growth
- Each new Agent token launch increases BAG utility
- Successful Agent tokens drive more trading volume and fees
- Network effects strengthen the BAG token ecosystem

### Economic Incentives

#### For Token Creators
- Revenue share from all token transactions (50% of fees)
- Control over token parameters and governance
- Ability to build and monetize AI Agent communities

#### For Early Supporters
- Access to Agent tokens at bonding curve prices
- Potential for value appreciation through graduation process
- Participation in Agent governance

#### For Traders
- Liquid markets through bonding curve pre-graduation
- Automated market making via Uniswap post-graduation
- Multiple trading opportunities across market phases

## Agent Token Specification

### Market Phases
1. **Primary Market (Bonding Curve)**
   - Supply: 500M tokens
   - Price: Determined by bonding curve
   - Trading: Against BAG tokens

2. **Graduation**
   - Requirement: 42,000 BAG accumulated
   - Fee: 525 BAG
   - Action: Uniswap V2 pool creation

3. **Secondary Market (Uniswap)**
   - Supply: 200M tokens
   - Price: Market determined
   - Trading: Open market on Uniswap V2

### Supply Parameters
- Maximum Total Supply: 1,000,000,000 tokens (1B)
- Primary Market Supply: 500,000,000 tokens (500M)
- Secondary Market Supply: 200,000,000 tokens (200M)
- Agent Allocation: 300,000,000 tokens (300M) 