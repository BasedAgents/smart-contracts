# Frequently Asked Questions

## Table of Contents
- [General Questions](#general-questions)
- [For Agent Creators](#for-agent-creators)
- [For Token Holders & Governance](#for-token-holders--governance)
- [For Traders](#for-traders)
- [For BAG Token Holders](#for-bag-token-holders)
- [Technical Questions](#technical-questions)
- [Platform Economics](#platform-economics)

## General Questions

### What is BasedAgents?
BasedAgents is the universal marketplace for AI Agents, where anyone can launch, trade, and govern AI Agent tokens. It's designed to be the foundation for autonomous organizations powered by AI.

### What is an AICO?
AICO (AI Coin Offering) is our standardized launch mechanism for AI Agent tokens. It provides a fair distribution through a bonding curve and ensures proper governance mechanisms are in place.

### What makes BasedAgents different from other AI token platforms?
Unlike platforms launching mere meme tokens, BasedAgents provides real utility and governance power. Token holders can control their Agent's treasury, code, and strategic direction through comprehensive governance mechanisms.

### Which blockchain is BasedAgents on?
BasedAgents is deployed on Base, chosen for its high performance, low costs, and strong ecosystem support.

## For Agent Creators

### How do I launch an Agent on BasedAgents?
1. Pay the 100 BAG creation fee
2. Configure your Agent parameters
3. Deploy through the AICO Factory
4. Set up initial governance parameters
5. Begin the token distribution through the bonding curve

### What are the costs involved in launching an Agent?
- Agent Creation Fee: 100 BAG
- Gas costs for deployment (subsidized for pool creation)
- Graduation Fee: 525 BAG (paid when transitioning to Uniswap)

### Can I modify my Agent after launch?
By default, the Agent creator (designated as the Director) maintains control over the Agent's code, parameters, and strategy. This allows for agile development and quick responses to opportunities or challenges. However, token holders have the power to:
1. Veto any changes they disagree with
2. Vote to transfer the Director role to a different address
3. Modify governance parameters through proposals

This balanced approach ensures both efficient operation and token holder protection.

### What initial control does an Agent Creator have?
By default, the Agent Creator (Director) has strong protections and control:
1. Exclusive proposal rights (only the Director can create proposals initially)
2. Full control over who can submit proposals
3. Ability to set minimum token balance requirements for proposals
4. Control over governance parameter changes
5. Direct operational control of the Agent

This means that while token holders have veto power, they cannot initiate changes without the Director's consent. The Director effectively maintains full control of the Agent unless they choose to decentralize further or token holders vote to transfer the Director role.

### How flexible is the governance system?
The governance system is designed to support progressive decentralization and can adapt as your Agent evolves:

**Initial Setup Options:**
- Single Controller: Director maintains full control
- Multi-signature: Require multiple parties to approve actions
- Limited DAO: Open some decisions to token holders
- Full DAO: Completely community-governed

**Progressive Decentralization:**
1. Start with centralized control for rapid development
2. Gradually open proposal rights to trusted parties
3. Implement token balance requirements for proposals
4. Eventually transition to full community governance

**Governance Models:**
- Traditional: Single Director control
- Multi-sig: Group of trusted parties
- Hybrid: Director + community proposals
- Full DAO: Complete token holder control
- Custom: Any combination of the above

This flexibility allows Agents to:
- Start simple and grow in sophistication
- Adapt governance as the community grows
- Implement custom voting strategies
- Balance efficiency with decentralization
- Evolve their governance model over time

### What frameworks can I use for my Agent?
Currently, we support the Eliza framework. Additional frameworks will be integrated based on community governance decisions.

### How is the token supply distributed?
- Total Supply: 1B tokens
- Primary Market (Bonding Curve): 500M
- Secondary Market (Uniswap): 200M
- Agent Treasury: 300M

## For Token Holders & Governance

### What can I control as a token holder?

**As an Agent Token Holder:**
- Agent's treasury and fund allocation
- Agent's code and operational parameters
- Agent's strategic direction and partnerships
- Agent's operational rules and constraints
- Agent's revenue model

**As a BAG Token Holder:**
- Protocol-level parameters and contracts
- Platform fee structures and recipients
- Core infrastructure integrations (WETH, Uniswap, etc.)
- Protocol treasury management
- Framework integrations and upgrades

### What protections do token holders have?
Token holders are protected in several ways:

**Transparency:**
- All governance parameters are public and visible before token purchase
- Agent's governance system is encoded in smart contracts
- Any changes to governance must be announced with delay periods
- Full visibility of Agent's code and operations

**Market Forces:**
- Agent creators are incentivized to establish attractive governance systems
- Token holders can choose not to buy tokens if governance terms are unfavorable
- Competition between Agents drives better governance standards
- Market value reflects quality of governance structure

**Built-in Safeguards:**
- Veto power over Director's actions
- Ability to transfer Director role with sufficient votes
- Mandatory delay periods before major changes
- Protection of treasury through governance

**Governance Evolution:**
- Token holders can see the planned governance roadmap
- Clear understanding of current vs. future governance rights
- Ability to participate in governance improvements
- Transparency about decentralization timeline

This system creates a natural balance where:
1. Agent creators need to attract token holders with good governance
2. Token holders can make informed decisions before investing
3. Market forces reward well-governed Agents
4. Bad actors are disincentivized through transparency

### How does governance work?

The governance system operates through three interconnected smart contracts:

1. **AICOGovernor Contract**:
   - Handles major governance decisions
   - Controls critical system changes
   - Uses stricter voting parameters
   - Manages Director role transfers

2. **VetoContract**:
   - Enables quick response to concerning actions
   - Uses lighter voting parameters
   - Allows token holders to block actions
   - Operates during delay periods

3. **DelayModule**:
   - Enforces mandatory waiting periods
   - Checks for vetoes before execution
   - Ensures time for community review
   - Prevents rushed changes

### What are the voting parameters?

The system has two sets of voting parameters for different types of actions:

1. **Standard Veto Actions**:
   - For regular operational decisions
   - 72-hour voting period
   - 10% quorum requirement
   - >50% threshold to pass
   - 24-hour delay period

2. **Critical System Changes**:
   - For fundamental changes (e.g., Director transfer)
   - 7-day voting period
   - 20% quorum requirement
   - >66% threshold to pass
   - 48-hour delay period

### What are the risks of this governance system?

1. **Gridlock Risks**:
   - Quorum failures in inactive communities
   - Competing interests blocking progress
   - Delays during time-critical situations
   - Token distribution affecting voting power

2. **Mitigation Strategies**:
   - Active community engagement
   - Clear communication channels
   - Proper planning for changes
   - Balanced token distribution
   - Delegation mechanisms

3. **Emergency Limitations**:
   - No bypass for mandatory delays
   - Must wait 24-48 hours for actions
   - Could miss market opportunities
   - Plan ahead for time-sensitive needs

### When can I start participating in governance?
Immediately after acquiring tokens. Governance rights are active throughout all market stages.

### Can governance parameters be changed?
Yes, through governance votes. Token holders can propose and vote on changes to governance parameters.

### What are the default governance parameters?
The default parameters are designed to balance creator autonomy with token holder protection:

**For Protocol-Level Changes (BAG Token Holders):**
These parameters apply to changes that affect the entire protocol:
- Modifying protocol fee structures
- Updating protocol integration addresses (fee recipient, rewards contract, WETH, Uniswap contracts)
- Upgrading core protocol contracts
- Managing protocol treasury

**For Agent-Level Changes (Agent Token Holders):**
These parameters apply to changes specific to an individual Agent:
- Changing the Director (Agent creator) address
- Modifying the Agent's governance system
- Updating Agent-specific parameters
- Managing Agent treasury

**For Critical System Changes:**
These parameters apply specifically to:
- Changing the Director (Agent creator) address
- Modifying the governance system itself
- Updating protocol integration addresses (fee recipient, rewards contract, WETH, Uniswap contracts)
- Changing the Agent's fundamental rules

**Veto Parameters:**
- Voting Period: 72 hours
- Quorum: 10% of total token supply must vote
- Threshold: >50% of votes must be in favor to veto
- Delay Period: 24 hours between proposal and execution

**Director Transfer:**
- Voting Period: 7 days
- Quorum: 20% of total token supply must vote
- Threshold: >66% of votes must be in favor
- Delay Period: 48 hours between approval and transfer

**General Governance:**
- Proposal Threshold: 1% of total supply to submit proposals
- Voting Period: 5 days
- Quorum: 15% of total token supply must vote
- Threshold: >50% of votes must be in favor
- Timelock: 24 hours between approval and execution

**Important Note:** Day-to-day Agent operations (like spending from the Agent's wallet, updating Agent code, or modifying operational parameters) are controlled by the Director (Agent creator) by default. Token holders have veto power over these actions but don't need to actively approve each transaction. This ensures the Agent can operate efficiently while maintaining token holder protection.

These parameters can be modified through governance votes, requiring:
- Quorum: 20% of total supply
- Threshold: >66% of votes in favor
- Timelock: 48 hours

## For Traders

### How do I buy Agent tokens?
1. **During Primary Market**: Purchase through the bonding curve using BAG tokens
2. **After Graduation**: Trade on Uniswap or other supported DEXes

### How is the price determined?
- Primary Market: By the bonding curve formula (y = A*e^(Bx))
- Secondary Market: By supply and demand on Uniswap

### What happens during market graduation?
- Primary market supply is exhausted
- Graduation fee of 525 BAG is paid
- Liquidity pool is created on Uniswap
- Secondary market trading begins

### Are there any trading fees?
Yes, a 1% fee on all trades, distributed as:
- Agent's Wallet: 50%
- Protocol Treasury: 25%
- Platform Referrer: 10%
- Order Referrer: 15%

## For BAG Token Holders

### What gives BAG value?
1. Required for Agent creation (100 BAG fee)
2. Exclusive currency for buying Agent tokens
3. Graduation fees (525 BAG)
4. Protocol governance rights
5. Share of platform fees

### Can I stake BAG?
Currently, BAG is used for governance and Agent token purchases. Staking mechanisms may be proposed through governance.

### What can I govern with BAG?
- Protocol parameters
- Fee structures
- Contract upgrades
- Treasury management
- Framework integrations

### Where can I buy BAG?
BAG will be available on Uniswap and other DEXes after launch. Initial distribution includes allocations for liquidity providers and the ecosystem fund.

## Technical Questions

### How secure are the smart contracts?
**Important Security Notice**: The BasedAgents smart contracts have not undergone a formal security audit yet. Security audits will be performed once we reach a more stable release version of the protocol. Users should be aware that interacting with unaudited smart contracts carries significant risk. Use the protocol at your own risk.

However, we have implemented several security measures in the meantime:
- Bug Bounty Program funded by Based Agents DAO (see BugBounty.md)
- Rewards up to 100,000 BAG for critical vulnerabilities
- Built on battle-tested OpenZeppelin contracts
- Internal security reviews and testing
- Time-locked governance actions
- Veto capabilities for protection

We strongly encourage security researchers to review our code and participate in our bug bounty program. All bounties are paid in BAG tokens. The bug bounty program will continue to run even after formal audits are completed to ensure ongoing security.

### What happens if an Agent's code needs updating?
Updates must be proposed and approved through governance. Token holders review and vote on any changes.

### Can Agents interact with each other?
Yes, through our Agent-to-Agent protocols (coming in Phase 2). This enables collaboration, negotiation, and complex multi-agent operations.

### How are Agent wallets secured?
Agents use Coinbase's AgentKit, which provides enterprise-grade MPC (Multi-Party Computation) wallets. This means:
- No single point of failure for private keys
- Industry-leading security standards
- Built-in fraud prevention
- Institutional-grade custody solution
- Seamless integration with major blockchains

### How customizable is the Agent's fund management?
Agent Creators and/or token holders have complete control over fund management:
- Custom spending limits and thresholds
- Multi-signature requirements
- Time-locks on transactions
- Whitelist/blacklist addresses
- Complex transaction rules
- Custom approval workflows
- Integration with external oracles
- Automated rebalancing strategies

### What support is available for building Agents?
We understand that building AI Agents can be challenging, especially given how rapidly the technology is evolving. That's why we offer:
1. Direct support from our team
2. Partnership with specialized development firms
3. Templates and starter kits
4. Documentation and tutorials
5. Custom Agent development through our support partners

If you need help building or customizing your Agent, our support partners can handle the technical implementation while you focus on the strategy and vision.

### How do I manage my Agent's code?
Agent source code management is streamlined through GitHub integration:
1. Login with your GitHub account
2. Connect your repository
3. Automatic syncing with your Agent
4. Full version control
5. Collaborative development
6. Automated deployments

Any changes you make to the codebase are automatically reflected in your Agent (subject to governance parameters).

### What are the operational costs for running an Agent?
Running an Agent involves various operational costs:
1. Eliza Framework costs:
   - Instance hosting and compute
   - Model inference
   - Framework maintenance
   These costs are covered by BasedAgents or our partners if your Agent maintains the required minimum trading volume.

2. Other operational costs (covered by Agent Creator):
   - API calls to external services
   - Custom compute resources
   - Data storage
   - Additional integrations

### How is liquidity managed?
- Initial liquidity provided during graduation
- Additional liquidity can be added through governance
- Liquidity parameters configurable through governance

### What happens if my Agent's volume drops below the minimum?
- Agent operations pause automatically
- All funds remain secure and governed
- You can:
  1. Sponsor the Agent to resume operations
  2. Wait for volume to naturally increase
  3. Modify strategy to increase volume
  4. Transfer operations to a different framework

## Platform Economics

### How do referral rewards work?
- Platform Referrers earn 10% of fees from trades through their interface
- Order Referrers earn 15% of fees from trades they refer
- Referral relationships are permanent per Agent token

### How is liquidity managed?
- Initial liquidity provided during graduation
- Additional liquidity can be added through governance
- Liquidity parameters configurable through governance

### What happens to collected fees?
- Agent's Wallet fees (50%) are controlled by token holders
- Protocol Treasury fees (25%) fund development and operations
- Referral fees (25%) incentivize ecosystem growth

Have more questions? Join our community channels or reach out to our support team. 