# Based Agents Protocol Tokenomics

## Core Token: $BAG

### Overview
The BAG token is the native token of the Based Agents ecosystem, powering the entire protocol through three core functions:
1. Agent Token Creation & Trading
2. Protocol Governance
3. Value Accrual through Protocol Fees

### Total Supply and Distribution
- Total Supply: 1,000,000,000 BAG (1B tokens)

| Category | Allocation | Amount | Notes |
|----------|------------|--------|-------|
| Genesis Agent | 35% | 350M | Initially managed by Community Multisig |
| Liquidity Providers | 35% | 350M | |
| └ Initial LPs/Team | 29% | 290M | 36-month linear vesting |
| └ Secondary LPs | 1% | 10M | 3-12 month vesting based on entry price |
| └ Public LP Rewards | 5% | 50M | Open participation program |
| AI3 Agent | 30% | 300M | 50% distributed to BAG/ETH LPs |

For detailed information about the Genesis Agent and AI3 Agent, please refer to [Ecosystem Agents](./EcosystemAgents.md).

### Economic Model

#### Agent Token Creation
- New Agent tokens are launched through the AICO (AI Coin Offering) process
- Each launch requires BAG tokens for:
  - Creation fee of 100 BAG paid to Protocol Treasury
  - Token purchases through the bonding curve
  - Transaction fees and graduation fees
  - Initial liquidity provision

Note: Pool creation costs are covered by the protocol's PoolCreationSubsidy contract, ensuring Agent creators only need to pay the BAG token fees.

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

#### Protocol Treasury Management
- Protocol Treasury receives 25% of all transaction fees
- Genesis Agent can selectively burn BAG tokens from Protocol Treasury
- Burning schedule and amounts determined by Genesis Agent
- Creates deflationary pressure based on protocol usage
- Helps maintain long-term value alignment

### Value Accrual Mechanisms

#### 1. Agent Creation Fee
- Initial Amount: 100 BAG
- Recipient: Protocol Treasury
- Timing: One-time fee at Agent token creation
- Purpose: Ensures quality Agent launches and supports protocol development
- Upgradable: Yes, through protocol governance

#### 2. Transaction Fees
All Agent token transactions incur a 1% fee in BAG, distributed to:
- Agent Wallet: 50% (5000 BPS)
- Protocol Treasury: 25% (2500 BPS)
- Platform Referrer: 10% (1000 BPS)
- Order Referrer: 15% (1500 BPS)

##### Fee Distribution Explained

**Agent Wallet (50%)**
- Direct revenue to the Agent's Wallet
- Used for Agent operations and development
- Paid automatically on every transaction

**Protocol Treasury (25%)**
- Funds protocol development and maintenance
- Supports ecosystem growth initiatives
- Used for protocol upgrades and improvements

**Platform Referrer (10%)**
The Platform Referrer fee incentivizes the development of any integration that enables users to interact with Based Agents:
- Any developer or project can integrate with Based Agents by becoming a Platform Referrer
- Based Agents.co is just one reference implementation
- Integration possibilities include:
  - Trading interfaces (web, mobile, desktop)
  - Trading APIs and SDKs
  - AI Agents that facilitate trading
  - Portfolio management tools
  - Trading bots and automation systems
  - Analytics and market data platforms
  - Browser extensions
  - Telegram/Discord bots
  - DeFi aggregators
  - Cross-chain bridges
- Platform Referrers earn 10% of all transaction fees generated through their integration
- The referral address is set when the Agent token is created through their integration
- Revenue is earned perpetually from all future trades through that integration
- This creates an ecosystem of complementary tools and services around Based Agents

**Order Referrer (15%)**
The Order Referrer system enables community-driven growth through a referral program:
- Anyone can become an Order Referrer by sharing their referral address
- Referrers earn 15% of the transaction fee when:
  - A user makes any trade using their referral code
  - All subsequent trades by that user will generate referral fees
- Example:
  - On a 1000 BAG trade (1% fee = 10 BAG):
    - Referrer earns 1.5 BAG (15% of fee)
    - This applies to all future trades by the referred user
- Each trade specifies the referrer address
- If no referrer is specified, the fee goes to Protocol Treasury

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