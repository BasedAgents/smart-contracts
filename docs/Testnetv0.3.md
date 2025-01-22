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

## Contract Verification Notes

### Special Case: Governor Proxy Verification
The Governor proxy contract at `0xC2b28e195ecB9d3d568Cb94FE9c0A960791e728a` required special handling for verification. This was because:

1. The initial verification attempt failed as the proxy contract needed explicit contract type specification
2. The proxy was created by the AICOFactory during AICO creation, making it different from other proxies deployed directly

The solution was to create a dedicated verification script ([scripts/verify-governor.js](../scripts/verify-governor.js)) that:
- Verifies the Governor Logic implementation
- Explicitly specifies the ERC1967 proxy contract type
- Provides the correct constructor arguments for the proxy

This script resolved the verification issue that wasn't caught by the main verification script because:
- The main script assumes standard proxy deployment patterns
- Factory-created proxies need explicit contract type specification
- The proxy's constructor arguments needed to be correctly specified

### Verification Status
| Contract | Address | Status | Notes |
|----------|----------|---------|--------|
| Governor Logic | `0x3c21c9bC638030AC0ea30ba76d00184d4940b265` | ✅ Verified | Implementation contract |
| Governor Proxy | `0xC2b28e195ecB9d3d568Cb94FE9c0A960791e728a` | ✅ Verified | Required special verification |

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

### 1. Factory Verification & Initial Setup
Use this contract:
- AICOFactory Proxy: [0xe3a9C604E31197FB817077e01dB01a384B27BD5A](https://sepolia.etherscan.io/address/0xe3a9C604E31197FB817077e01dB01a384B27BD5A#writeContract)

Tests:
- [ ] Verify factory points to correct implementations:
  1. Go to "Read Contract" tab
  2. Call `aicoLogic()` - should return: `0xB51EBf00B54C8a31ef5076F3D77A201637Bde963`
  3. Call `governorLogic()` - should return: `0x3c21c9bC638030AC0ea30ba76d00184d4940b265`

- [ ] Verify factory owner permissions:
  1. Go to "Read Contract" tab
  2. Call `owner()` - should return your deployer address: `0x82fED030C262ec0262624aaD0a17A0d1eDA24EA1`
  3. Go to "Write Contract" tab
  4. Try to call `setAICOLogic()` with a random address from a non-owner wallet - should revert
  5. Try to call `setGovernorLogic()` with a random address from a non-owner wallet - should revert
  6. Connect your owner wallet and try the same calls - should allow the transaction (but don't confirm it)
  7. Check `upgradeTo()` and `upgradeToAndCall()` have the same permission behavior

### 2. Agent Token Deployment & Management
Use these contracts:
- AICOFactory Proxy: [0xe3a9C604E31197FB817077e01dB01a384B27BD5A](https://sepolia.etherscan.io/address/0xe3a9C604E31197FB817077e01dB01a384B27BD5A#writeContract)
- AICO Runtime: [0xBE93B86ca2f90D5408cF163151dfE0fD1fdcFBa1](https://sepolia.etherscan.io/address/0xBE93B86ca2f90D5408cF163151dfE0fD1fdcFBa1#writeContract)
- BAG Token: [0x780DB7650ef1F50d949CB56400eE03052C7853CC](https://sepolia.etherscan.io/address/0x780DB7650ef1F50d949CB56400eE03052C7853CC#writeContract)

Tests:
- [ ] Deploy new Agent token through Factory:
  1. Go to "Write as Proxy" tab on AICOFactory
  2. Call `createAICOWithGovernor` with these parameters:
     - `aicoInitData`: `0x077f224a000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000082fed030c262ec0262624aad0a17a0d1eda24ea100000000000000000000000000000000000000000000000000000000000000a54657374204167656e740000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004544553540000000000000000000000000000000000000000000000000000000000`
       (This encodes: name="Test Agent", symbol="TEST", platformReferrer=deployer address)
     - `tokenCreator`: Your wallet address
     - `votingDelay`: `1` (1 block ≈ 12 seconds)
     - `votingPeriod`: `50` (50 blocks ≈ 10 minutes)
     - `proposalThreshold`: `0` (no minimum tokens needed to propose)

  Note: If you want to use different parameters, use the script at `scripts/encode-aico-init.js` to generate new encoded data.

- [ ] After deployment, verify the new token:
  1. Note the new AICO address from the deployment transaction
  2. Go to "Read Contract" tab on the new AICO and verify:
     - `name()` returns "Test Agent" (or your chosen name)
     - `symbol()` returns "TEST" (or your chosen symbol)
     - `decimals()` returns `18`
     - `totalSupply()` returns `300000000000000000000000000` (300M with 18 decimals)
     - `governor()` returns the new Governor address
     - `balanceOf(governor_address)` returns the full 300M supply

### 3. Post-Deployment Setup & Permissions
Use these contracts:
- BondingCurve Proxy: [0xf85dDb30e8cDEE17dA5dD9526eE7951F50fe914F](https://sepolia.etherscan.io/address/0xf85dDb30e8cDEE17dA5dD9526eE7951F50fe914F#writeContract)
- AICO Runtime: [0xBE93B86ca2f90D5408cF163151dfE0fD1fdcFBa1](https://sepolia.etherscan.io/address/0xBE93B86ca2f90D5408cF163151dfE0fD1fdcFBa1#readContract)
- Governor: [0xC2b28e195ecB9d3d568Cb94FE9c0A960791e728a](https://sepolia.etherscan.io/address/0xC2b28e195ecB9d3d568Cb94FE9c0A960791e728a#readContract)

- [ ] Verify BondingCurve ownership is transferred to AICO (Check `owner()` on BondingCurve Proxy)
- [ ] Verify AICO has correct router set (Call `uniswapV2Router()` on AICO Runtime)
- [ ] Verify Governor has correct voting delay/period (Call `votingDelay()` and `votingPeriod()` on Governor)

### 4. Bonding Curve Operations
Use these contracts:
- AICO Runtime: [0xBE93B86ca2f90D5408cF163151dfE0fD1fdcFBa1](https://sepolia.etherscan.io/address/0xBE93B86ca2f90D5408cF163151dfE0fD1fdcFBa1#writeContract)
- BAG Token: [0x780DB7650ef1F50d949CB56400eE03052C7853CC](https://sepolia.etherscan.io/address/0x780DB7650ef1F50d949CB56400eE03052C7853CC#writeContract)
- ProtocolRewards: [0xD0AD1FDA6Bda09ea5cff81ccAaf56eB5E60cdb4c](https://sepolia.etherscan.io/address/0xD0AD1FDA6Bda09ea5cff81ccAaf56eB5E60cdb4c#readContract)

- [ ] Test small buy (1-5 BAG) through AICO Runtime
- [ ] Verify correct token minting ratio (~11.9M tokens per 1k BAG)
- [ ] Test token selling through AICO Runtime
- [ ] Verify fees are distributed to ProtocolRewards

### 5. Governance Testing
Use these contracts:
- Governor: [0xC2b28e195ecB9d3d568Cb94FE9c0A960791e728a](https://sepolia.etherscan.io/address/0xC2b28e195ecB9d3d568Cb94FE9c0A960791e728a#writeContract)
- AICO Runtime: [0xBE93B86ca2f90D5408cF163151dfE0fD1fdcFBa1](https://sepolia.etherscan.io/address/0xBE93B86ca2f90D5408cF163151dfE0fD1fdcFBa1#readContract)

**Voting Parameters**:
- `votingDelay`: 1 block (~12 seconds) - Time between proposal creation and voting start
- `votingPeriod`: 50 blocks (~10 minutes) - Duration of voting period

These short periods are for testing purposes. On mainnet, these would typically be much longer (e.g., 1 day delay, 1 week voting period).

Tests:
- [ ] Check Governor's token balance (should be 300M)
- [ ] Create test proposal for a small transfer
- [ ] Vote on proposal
- [ ] Execute proposal after voting period
- [ ] Verify proposal execution succeeded

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