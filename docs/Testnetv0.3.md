# Sepolia Testnet Deployment v0.3

## Deployment Information
- **Script Used**: `scripts/AICOFlow.sepolia.deploy.js`
- **Total Deployment Cost**: 0.034 ETH (~$68 at current prices)
- **Status**: Successfully deployed and passed local tests using `test/AICOFlow.local.test.js`
- **Next Steps**: Run `test/AICOFlow.sepolia.test.js` and perform manual testing checklist below

## Contract Verification

### Verification Process
1. Automated verification using `scripts/verify.sepolia.js` for all logic contracts
2. Manual verification required for proxy contracts:
   - Visit each proxy contract on Etherscan
   - Click "More Options" -> "Is this a proxy?"
   - Click "Verify" to verify the proxy implementation
   - Confirm implementation contract is linked correctly

## Core Contracts

| Contract | Address | Verification Status |
|----------|---------|-------------------|
| BAG Token | `0x780DB7650ef1F50d949CB56400eE03052C7853CC` | External - Already Verified |
| BondingCurve Logic | `0x4a3Dc349011E52d9970d1cb99363eB3484b33Bbf` | ✅ Verified |
| BondingCurve Proxy | `0xf85dDb30e8cDEE17dA5dD9526eE7951F50fe914F` | 🔄 Needs Manual Proxy Verification |
| PoolCreationSubsidy Logic | `0xf45d8D7c51ff65fCD25CDF692a154D3626Be0B7b` | ✅ Verified |
| PoolCreationSubsidy Proxy | `0xA125e5E0366C4d9F7435227F966d4a718c95c58F` | 🔄 Needs Manual Proxy Verification |
| ProtocolRewards | `0xD0AD1FDA6Bda09ea5cff81ccAaf56eB5E60cdb4c` | ✅ Verified |

## AICO Contracts

| Contract | Address | Verification Status |
|----------|---------|-------------------|
| AICO Logic | `0xB51EBf00B54C8a31ef5076F3D77A201637Bde963` | ✅ Verified |
| Governor Logic | `0x3c21c9bC638030AC0ea30ba76d00184d4940b265` | ✅ Verified |
| AICOFactory Logic | `0x1A662028cA2EdF1D14aF1cD05602C4AEbe417631` | ✅ Verified |
| AICOFactory Proxy | `0xe3a9C604E31197FB817077e01dB01a384B27BD5A` | 🔄 Needs Manual Proxy Verification |
| AICO (Runtime) | `0xBE93B86ca2f90D5408cF163151dfE0fD1fdcFBa1` | 🔄 Needs Manual Proxy Verification |
| Governor | `0xC2b28e195ecB9d3d568Cb94FE9c0A960791e728a` | 🔄 Needs Manual Proxy Verification |

## External Contracts

| Contract | Address | Notes |
|----------|---------|--------|
| Uniswap V2 Factory | `0xF62c03E08ada871A0bEb309762E260a7a6a880E6` | Official Sepolia V2 Factory |
| Uniswap V2 Router | `0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3` | Official Sepolia V2 Router |
| WETH | `0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9` | Official Sepolia WETH |

## Manual Testing Checklist

### 1. Initial Setup & Permissions
Use these contracts:
- BondingCurve Proxy: [0xf85dDb30e8cDEE17dA5dD9526eE7951F50fe914F](https://sepolia.etherscan.io/address/0xf85dDb30e8cDEE17dA5dD9526eE7951F50fe914F#writeContract)
- AICO Runtime: [0xBE93B86ca2f90D5408cF163151dfE0fD1fdcFBa1](https://sepolia.etherscan.io/address/0xBE93B86ca2f90D5408cF163151dfE0fD1fdcFBa1#readContract)
- Governor: [0xC2b28e195ecB9d3d568Cb94FE9c0A960791e728a](https://sepolia.etherscan.io/address/0xC2b28e195ecB9d3d568Cb94FE9c0A960791e728a#readContract)

- [ ] Verify BondingCurve ownership is transferred to AICO (Check `owner()` on BondingCurve Proxy)
- [ ] Verify AICO has correct router set (Call `uniswapV2Router()` on AICO Runtime)
- [ ] Verify Governor has correct voting delay/period (Call `votingDelay()` and `votingPeriod()` on Governor)

### 2. Bonding Curve Operations
Use these contracts:
- AICO Runtime: [0xBE93B86ca2f90D5408cF163151dfE0fD1fdcFBa1](https://sepolia.etherscan.io/address/0xBE93B86ca2f90D5408cF163151dfE0fD1fdcFBa1#writeContract)
- BAG Token: [0x780DB7650ef1F50d949CB56400eE03052C7853CC](https://sepolia.etherscan.io/address/0x780DB7650ef1F50d949CB56400eE03052C7853CC#writeContract)
- ProtocolRewards: [0xD0AD1FDA6Bda09ea5cff81ccAaf56eB5E60cdb4c](https://sepolia.etherscan.io/address/0xD0AD1FDA6Bda09ea5cff81ccAaf56eB5E60cdb4c#readContract)

- [ ] Test small buy (1-5 BAG) through AICO Runtime
- [ ] Verify correct token minting ratio (~11.9M tokens per 1k BAG)
- [ ] Test token selling through AICO Runtime
- [ ] Verify fees are distributed to ProtocolRewards

### 3. Governance Testing
Use these contracts:
- Governor: [0xC2b28e195ecB9d3d568Cb94FE9c0A960791e728a](https://sepolia.etherscan.io/address/0xC2b28e195ecB9d3d568Cb94FE9c0A960791e728a#writeContract)
- AICO Runtime: [0xBE93B86ca2f90D5408cF163151dfE0fD1fdcFBa1](https://sepolia.etherscan.io/address/0xBE93B86ca2f90D5408cF163151dfE0fD1fdcFBa1#readContract)

- [ ] Check Governor's token balance (should be 300M)
- [ ] Create test proposal for a small transfer
- [ ] Vote on proposal
- [ ] Execute proposal after voting period
- [ ] Verify proposal execution succeeded

### 4. Factory Verification
Use this contract:
- AICOFactory Proxy: [0xe3a9C604E31197FB817077e01dB01a384B27BD5A](https://sepolia.etherscan.io/address/0xe3a9C604E31197FB817077e01dB01a384B27BD5A#writeContract)

- [ ] Verify factory points to correct AICO/Governor implementations
- [ ] Verify factory owner permissions
- [ ] Optional: Try creating another AICO instance

### 5. Agent Token Deployment & Management
Use these contracts:
- AICOFactory Proxy: [0xe3a9C604E31197FB817077e01dB01a384B27BD5A](https://sepolia.etherscan.io/address/0xe3a9C604E31197FB817077e01dB01a384B27BD5A#writeContract)
- AICO Runtime: [0xBE93B86ca2f90D5408cF163151dfE0fD1fdcFBa1](https://sepolia.etherscan.io/address/0xBE93B86ca2f90D5408cF163151dfE0fD1fdcFBa1#writeContract)
- BAG Token: [0x780DB7650ef1F50d949CB56400eE03052C7853CC](https://sepolia.etherscan.io/address/0x780DB7650ef1F50d949CB56400eE03052C7853CC#writeContract)

Tests:
- [ ] Deploy new Agent token through Factory (`createAICOWithGovernor`)
  - Set appropriate voting delay/period
  - Use unique token name/symbol
  - Set correct platform referrer
- [ ] Verify Agent token metadata
  - Check token URI
  - Verify name and symbol
  - Confirm initial supply (300M to Governor)
- [ ] Test Agent token transfers
  - Transfer between accounts
  - Check transfer restrictions
- [ ] Test platform referrer functionality
  - Verify referrer fees during buys
  - Test referrer fee distribution
- [ ] Verify Agent token governance setup
  - Check Governor association
  - Test voting power delegation
  - Verify proposal creation rights

### 6. Market Graduation Testing
Use these contracts:
- AICO Runtime: [0xBE93B86ca2f90D5408cF163151dfE0fD1fdcFBa1](https://sepolia.etherscan.io/address/0xBE93B86ca2f90D5408cF163151dfE0fD1fdcFBa1#writeContract)
- BAG Token: [0x780DB7650ef1F50d949CB56400eE03052C7853CC](https://sepolia.etherscan.io/address/0x780DB7650ef1F50d949CB56400eE03052C7853CC#writeContract)
- Uniswap V2 Router: [0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3](https://sepolia.etherscan.io/address/0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3#writeContract)

- [ ] Calculate remaining tokens to 500M supply
- [ ] Prepare large BAG purchase to trigger graduation
- [ ] Execute graduation transaction
- [ ] Verify Uniswap pool creation
- [ ] Test post-graduation buying/selling

### 7. Error Cases & Limits
Use these contracts:
- AICO Runtime: [0xBE93B86ca2f90D5408cF163151dfE0fD1fdcFBa1](https://sepolia.etherscan.io/address/0xBE93B86ca2f90D5408cF163151dfE0fD1fdcFBa1#writeContract)
- Governor: [0xC2b28e195ecB9d3d568Cb94FE9c0A960791e728a](https://sepolia.etherscan.io/address/0xC2b28e195ecB9d3d568Cb94FE9c0A960791e728a#writeContract)

- [ ] Try exceeding max supply
- [ ] Attempt unauthorized operations
- [ ] Test slippage protection
- [ ] Verify timelock functionality

### Notes
- All contract interactions can be done through Etherscan's "Write Contract" interface
- Keep track of transaction hashes and gas costs
- Document any unexpected behavior or deviations from expected results
- For large value transactions, always test with small amounts first 