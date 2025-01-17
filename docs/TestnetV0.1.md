# Testnet V0.1 Deployment

This document contains the addresses of all smart contracts deployed to the Sepolia testnet for version 0.1.

## Understanding Proxy vs Implementation Contracts

Our system uses two types of contract deployments:

1. **Proxy + Implementation Pattern**:
   - Used for contracts that need to be upgradeable and maintain state
   - The Proxy is the address users interact with
   - The Implementation contains the logic but can be upgraded
   - Used by: BondingCurve, PoolCreationSubsidy, AICOFactory, and BAG Token

2. **Implementation-Only Pattern**:
   - Used for contracts that are deployed as templates
   - These implementations are cloned (using minimal proxies) when new Agents are created
   - No proxy needed as they serve as blueprints for future deployments
   - Used by: AICO Token and AICOGovernor

### Implications of Non-Upgradeable Templates

The AICO Token and AICOGovernor implementations serve as templates that are cloned for each new Agent. This design choice has important implications:

1. **Individual Agent Tokens/Governors Cannot Be Upgraded**:
   - Once an Agent's token and governor are deployed, their logic is immutable
   - This provides strong security guarantees to token holders
   - Agent creators cannot modify the rules after deployment
   - All Agents operate under the same fixed ruleset

2. **System-Wide Updates**:
   - To update the logic for future Agents, a new implementation is deployed
   - The AICOFactory is upgraded to point to the new implementation
   - Existing Agents continue using their original implementation
   - New Agents use the updated implementation

3. **Security Benefits**:
   - Token holders are protected from potential malicious upgrades
   - The governance system's rules cannot be changed after deployment
   - Provides stronger guarantees for long-term token holders

4. **Trade-offs**:
   - Cannot fix bugs in existing Agent contracts
   - Cannot add new features to existing Agents
   - Each major version change creates a split in the Agent ecosystem

## Core Contracts

### VetoContract
- Address: `0x7e95C26Db503Da6591E013bA023f48e3460c2412` ✅

### DelayModule
- Address: `0x40aFF0fDF2D35E2D670c24377F75C7918E2E5031` ✅

### ProtocolRewards
- Address: `0xB7168EDD8be601BFF6B93e6b0c06e70Df32Fcb78` ✅

### BondingCurve
- Proxy: `0xC323B369b7F1fe341BCCca0236fa9EA1cB119320`
- Implementation: `0x9c2851c615085D3AAe935EE7EbE0417Bc043C355` ✅

### PoolCreationSubsidy
- Proxy: `0xaBCeB7766464f0A57A9A477366339f727728c7B2`
- Implementation: `0x63c0b36672ba73fdB0A1317711bF98De1dDD22f6` ✅

### AICO Token
- Implementation: `0x22eaa14ba6C32495f8961B3dfD14A17531f74243` ✅
(Template contract - new instances are cloned for each Agent)

### AICOGovernor
- Implementation: `0x35d5FF6592FCF17F574c4702417ca0b627EC1C55` ✅
(Template contract - new instances are cloned for each Agent)

### AICOFactory
- Proxy: `0x148eea31e41371eFf65E9816a8d95Fc936DDF2E6`
- Implementation: `0xb38be1A050a6a3B83Ad1eFBd353A72168730FeBf` ✅

## External Contract References

### Uniswap V2
- Factory: `0xc35DADB65012eC5796536bD9864eD8773aBc74C4`
- WETH: `0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9`

### BAG Token
- Proxy: `0x780DB7650ef1F50d949CB56400eE03052C7853CC`
- Implementation: `0xc57B6a51bb32Ff1A5eFFf47B0AE02fc0FB70E36C`
- Owner/Initial Token Holder: `0x82fED030C262ec0262624aaD0a17A0d1eDA24EA1`

## Contract Verification Status

The following contracts have been verified on Sepolia Etherscan:
- VetoContract ✅
- DelayModule ✅
- ProtocolRewards ✅
- BAG Token Implementation ✅
- BondingCurve Implementation ✅
- PoolCreationSubsidy Implementation ✅
- AICO Token Implementation ✅
- AICOGovernor Implementation ✅
- AICOFactory Implementation ✅

## Notes
- All implementation contracts are designed to be upgradeable using the UUPS proxy pattern
- The AICOFactory contract uses the AICO Token and AICOGovernor implementations as templates to clone new instances for each Agent
- The BondingCurve contract handles the initial token distribution phase
- The PoolCreationSubsidy contract manages subsidies for liquidity pool creation
- The BAG Token has a fixed supply of 1,000,000,000 tokens with 18 decimals, all initially minted to the owner address 