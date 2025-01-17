# Testnet V0.1 Deployment

This document contains the addresses of all smart contracts deployed to the Sepolia testnet for version 0.1.

## Core Contracts

### BondingCurve
- Proxy: `0x0F8231577Be6362a6B78583eA03d3FDbCA3dfC68`
- Implementation: `0x9c2851c615085D3AAe935EE7EbE0417Bc043C355`

### PoolCreationSubsidy
- Proxy: `0x393F87E29B44A04Bd6Bf9E4DB00Ad545b5b06879`
- Implementation: `0x63c0b36672ba73fdB0A1317711bF98De1dDD22f6`

### AICO Token
- Implementation: `0xa9F491f7f446829dEE9127B79Ed2EADAA3742A60`

### AICOGovernor
- Implementation: `0x134A6fE08a524B346569585d36E3Fc206BE1399C`

### AICOFactory
- Proxy: `0xe818983aAC79AFb69C39b7ec19d1EC67b90452Ff`
- Implementation: `0xb38be1A050a6a3B83Ad1eFBd353A72168730FeBf`

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
- BAG Token Implementation ✅
- BondingCurve Implementation ✅
- PoolCreationSubsidy Implementation ✅
- AICO Token Implementation ✅
- AICOGovernor Implementation ✅
- AICOFactory Implementation ✅

## Notes
- All implementation contracts are designed to be upgradeable using the UUPS proxy pattern
- The AICOFactory contract can be used to deploy new AICO tokens and their associated governors
- The BondingCurve contract handles the initial token distribution phase
- The PoolCreationSubsidy contract manages subsidies for liquidity pool creation
- The BAG Token has a fixed supply of 1,000,000,000 tokens with 18 decimals, all initially minted to the owner address 