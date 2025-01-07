# Technical Documentation: AICO Protocol

## Current Implementation

### Token Creation
1. Token creator deploys a new AICO token through the factory
2. Token creator becomes the owner with governance rights (see Governance.md)
3. Token holders receive ERC20Votes-compatible tokens

### Smart Contract Architecture
- DelayModule for transaction timing control
- VetoContract for governance oversight
- ERC20Votes-compatible token for governance
- See Governance.md for detailed governance mechanisms

## Planned Integrations

### AgentKit Integration
1. **Agent Wallet Setup**:
   - Integration with Coinbase CDP AgentKit for wallet management
   - Configuration of wallet permissions and access controls
   - Setup of transaction signing and validation

2. **Contract Interaction Layer**:
   - AgentKit contract reading capabilities for:
     - Monitoring DelayModule events
     - Checking VetoContract status
     - Tracking governance decisions
   - Contract writing capabilities for:
     - Executing approved transactions
     - Managing token operations
     - Handling fee distributions

3. **DevOps Infrastructure**:
   - Monitoring service for contract events
   - Transaction queue management system
   - Automated response to governance decisions
   - Security and access control layer

### Transaction Security Layer
1. **DelayModule Integration**:
   - Agent monitoring of `TransactionProposed` events
   - Automated timing checks for execution windows
   - Integration with AgentKit for transaction execution

2. **VetoContract Integration**:
   - Real-time monitoring of veto status
   - Automated transaction cancellation on veto
   - Integration with governance decisions

3. **Custody Solution**:
   - Integration with Coinbase MPC Wallet (planned)
   - Configurable wallet migration options
   - Multi-signature support for critical operations

## Implementation Roadmap

### Phase 1: Core Infrastructure (Completed)
- Smart contract deployment and testing
- Basic governance functionality (see Governance.md)
- Token distribution mechanics

### Phase 2: AgentKit Integration (In Progress)
1. **DevOps Setup**:
   - Deploy monitoring infrastructure
   - Set up event listeners
   - Configure AgentKit connections

2. **Agent Configuration**:
   - Implement wallet management
   - Configure transaction handling
   - Set up governance response system

3. **Testing and Security**:
   - End-to-end integration testing
   - Security audit of Agent interactions
   - Performance optimization

### Phase 3: Advanced Features
- Dynamic risk thresholds
- Enhanced governance mechanisms (see Governance.md)
- Advanced custody solutions

## Example Workflow

### Agent Deployment

1. **Smart Contract Setup** (Completed):
   - Deploy token and governance contracts
   - Configure DelayModule and VetoContract
   - Set initial parameters

2. **Agent Infrastructure Setup** (Planned):
   - Initialize AgentKit integration
   - Configure monitoring services
   - Set up automated responses

### Transaction Flow

1. **Proposal Stage**:
   - Transaction proposed via `proposeTransaction`
   - Agent monitors proposal via AgentKit
   - Event logged in monitoring system

2. **Verification Stage**:
   - DelayModule timer tracking
   - VetoContract status monitoring
   - Governance decision validation

3. **Execution Stage**:
   - AgentKit validates execution conditions
   - Transaction executed if approved
   - Results logged and verified

## Security Considerations

1. **Smart Contract Security**:
   - Audited contract architecture
   - Time-locked operations
   - Governance oversight (see Governance.md)

2. **Agent Security** (Planned):
   - AgentKit security features
   - Multi-factor authentication
   - Rate limiting and monitoring

3. **Infrastructure Security**:
   - Secure DevOps practices
   - Regular security audits
   - Incident response procedures

## Market Graduation

### Pool Creation
- The Uniswap V2 pool is created only when the token graduates from the bonding curve to Uniswap
- This happens when all 500M tokens from the primary market supply are sold
- Pool creation is subsidized by the protocol through the PoolCreationSubsidy contract
- The pool parameters are immutable and set during graduation

### Pool Creation Subsidy
- The protocol maintains a PoolCreationSubsidy contract with ETH balance
- This contract pays for the gas costs of creating new Uniswap V2 pools
- Only authorized AICO tokens can request pool creation through this contract
- The subsidy removes the burden of pool creation costs from both token creators and buyers

### Graduation Process
1. All 500M tokens from primary market supply are sold
2. Graduation fee (525 BAG) is charged
3. Uniswap V2 pool is created and initialized using protocol's subsidy
4. Initial liquidity is added to the pool
5. Market type changes from BONDING_CURVE to UNISWAP_POOL
6. Trading continues on Uniswap with the remaining 200M token supply

### Gas Optimization
- Pool creation is deferred until graduation to save gas
- Pool creation costs are subsidized by the protocol
- If a token never graduates (doesn't sell all 500M tokens), no gas is spent on pool creation
- This optimization is especially important for tokens that may not reach graduation

## Token Allocation

### Initial Distribution
- Total Supply: 1,000,000,000 tokens (1B)
- Primary Market (Bonding Curve): 500,000,000 tokens (500M)
- Secondary Market (Uniswap): 200,000,000 tokens (200M)
- Agent Allocation: 300,000,000 tokens (300M)

### Agent Allocation
- 300M tokens are minted directly to the Agent's wallet at deployment
- These tokens are available immediately for:
  - Paying contributors
  - Funding grants
  - Other Agent operations
- The Agent's wallet address is set during token deployment and cannot be changed

### Market Graduation
- The Uniswap V2 pool is created only when the token graduates from the bonding curve to Uniswap
- This happens when all 500M tokens from the primary market supply are sold
- Pool creation is subsidized by the protocol through the PoolCreationSubsidy contract
- The pool parameters are immutable and set during graduation


