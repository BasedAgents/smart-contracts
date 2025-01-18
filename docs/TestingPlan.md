# Testing Plan and Results

## Agent Creation Tests

| Test Description | Script | Result | Transaction | Addresses |
|-----------------|--------|--------|-------------|-----------|
| Create Agent with only BAG fee (no ETH required) | [test_agent_creation.js](../scripts/test_agent_creation.js) | ✅ Success | [View](https://sepolia.etherscan.io/tx/0xa7475a0b66e51186b69d0bc157bf0fdd60aeeb9eadb5db0a6f305a4669184fa7) | Token: `0x98a42A21A3BaB08D63fC4fe94C703eB85fcB2DA7`<br>Governor: `0xA12eC19ebbB925D2EA47B51135c2659DBdd176E5` |

### Test Details

#### Create Agent with only BAG fee
- Verified only 100 BAG fee is required
- Pool creation costs handled by PoolCreationSubsidy contract
- No ETH required from Agent creator
- Successfully deployed token and governor contracts
- Events properly emitted with contract addresses

#### Token Supply and Distribution
- Maximum Total Supply: 1,000,000,000 tokens (1B)
  - Primary Market Supply: 500,000,000 (500M) - Managed by bonding curve contract (minted on-demand during purchases)
  - Secondary Market Supply: 200,000,000 (200M) - Reserved for Uniswap after graduation (not yet minted)
  - Agent Creator Allocation: 300,000,000 (300M) - Minted immediately to Agent Creator's wallet
- Current Supply: 300,000,000 tokens (visible on Etherscan)
- Initial token price: 1.06 BAG
- Graduation threshold: 42,000 BAG collected through bonding curve

Note: The primary market tokens (500M) are not pre-minted but are instead minted on-demand as users purchase through the bonding curve. This is why they're not visible in the initial token supply on Etherscan. 