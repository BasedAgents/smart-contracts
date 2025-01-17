# Testnet V0.1 Deployment

This document contains the addresses of all smart contracts deployed to the Sepolia testnet for version 0.1.

## Core Contracts

### BondingCurve
- Implementation: `0x9586A80F3F7289d94174050375c1899aE886Af62`

### PoolCreationSubsidy
- Implementation: `0x17A4a6372Db2B5EC22fD98144f36F4Ce2875F918`

### AICO Token
- Implementation: `0x63DE69FcEB2Ca6bfD7468ab8685f59D1E7Aab36c`

### AICOGovernor
- Implementation: `0x51E93838774a74126BC4c44b179004a1fDb2e96B`

### AICOFactory
- Implementation: `0x1e4888cbb3eB3DDe4BC9cE643b386E3B2f26DD1c`

## External Contract References

### Uniswap V2
- Factory: `0xc35DADB65012eC5796536bD9864eD8773aBc74C4`

### BAG Token
- Implementation: `0xCafEb3Dd19F644F06023C9064F8fd1f87Ac95e0A`

## Contract Verification Status

The following contracts have been verified on Sepolia Etherscan:
- AICO Token Implementation ✅
- AICOGovernor Implementation ✅

## Notes
- All implementation contracts are designed to be upgradeable using the UUPS proxy pattern
- The AICOFactory contract can be used to deploy new AICO tokens and their associated governors
- The BondingCurve contract handles the initial token distribution phase
- The PoolCreationSubsidy contract manages subsidies for liquidity pool creation 