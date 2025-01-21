# Sepolia Testnet Deployment v0.3

## Core Contracts

| Contract | Address | Notes |
|----------|---------|--------|
| BAG Token | `0x780DB7650ef1F50d949CB56400eE03052C7853CC` | Existing BAG token on Sepolia |
| BondingCurve (Proxy) | `0xdcC56e42d8636CF34454dDE4291244842d722267` | |
| BondingCurve Implementation | `0x7D3a3Fea038e023Dc74201e26D618C3e1FFCfB68` | Verified |
| PoolCreationSubsidy (Proxy) | `0x3B92BC685D326CbE82d1AC389ae0f396Bab95D12` | |
| ProtocolRewards | `0x7Ef2c150b3F92Eb4faE8c24E9A52D0cc03A686DB` | Verified |

## AICO Contracts

| Contract | Address | Notes |
|----------|---------|--------|
| AICO Implementation | `0x3dC3005576CbcBC3436f689f35b55cbd7e5e0CeB` | Verified |
| AICO Proxy | `0xd8eBdCBc2f223Cda6F853904bA717a161fC85eDa` | |
| AICOGovernorImpl (Proxy) | `0xA7944b53c6814dd9F72ef48FE260beC41AE14069` | |
| AICOGovernorImpl Implementation | `0xf6Ed4eD9042342D147805E2A76423561dfDC88eA` | Verified |
| AICOFactoryImpl (Proxy) | `0xd25F32FBfADa4b292B3066070ABA5428911e6fB4` | |

## External Contracts

| Contract | Address | Notes |
|----------|---------|--------|
| Uniswap V2 Factory | `0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f` | Canonical Uniswap V2 Factory |

## Deployment Parameters

- Bonding Curve Parameters:
  - A = 1.06 (1060000000000000000)
  - B = 0.023 (23000000000000000)

- Governor Parameters:
  - Voting Delay: 1
  - Voting Period: 100
  - Proposal Threshold: 0 