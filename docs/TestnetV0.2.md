# Testnet V0.2 Deployment

This document contains the addresses of all smart contracts deployed to the Sepolia testnet for version 0.2.

## External Dependencies

### BAG Token
- Proxy: `0x780DB7650ef1F50d949CB56400eE03052C7853CC`
- Implementation: `0xc57B6a51bb32Ff1A5eFFf47B0AE02fc0FB70E36C`
- Owner/Initial Token Holder: `0x82fED030C262ec0262624aaD0a17A0d1eDA24EA1`

> **Important for Mainnet Deployment**: The BAG token address is referenced in the following contracts:
> - BondingCurve (constructor argument)
> - AICO (as a constant: `IERC20 public constant BAG`)
> - AICOFactory (initialization parameter)
>
> These references must be updated to the mainnet BAG token address during mainnet deployment.

### Uniswap V2 (Sepolia)
- Factory: `0xc35DADB65012eC5796536bD9864eD8773aBc74C4`
- WETH: `0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9`

## Core Contracts

### Base Contracts
- VetoContract: `0xd87e8e5baAbB3e1b7A7180c61F4D785064abb666`
- DelayModule: `0x701317841664a38F3670a37488E6A798272a197D`
- ProtocolRewards: `0xcFfA695ed8b028d68EA3C8040e052192DE3f4da0`

### Market Contracts
- BondingCurve: `0xFcddB2316bCb51CF6E19f21f3551BE634971819b`
- PoolCreationSubsidy: `0x081d7bAd34a8D6B738b225496b62934ef23E4DC1`

### AICO System
- AICO Implementation: `0x63E17b8b5ea3C24D61A3797D4fe070ba43602575`
- AICOGovernor Implementation: `0x5AC19de45486d39a57813211D809a6E631B01b5f`
- AICOFactoryImpl: `0xFa0Bf1850536DaF35b72DD72fdaB9EE0B507016C`
- AICOFactory: `0x15fE485c1D8f6e41BD095BDf2b6Ec858d15C8bFb`

## Contract Verification Status

### ✅ Verified Contracts
- VetoContract: [0xd87e8e5baAbB3e1b7A7180c61F4D785064abb666](https://sepolia.etherscan.io/address/0xd87e8e5baAbB3e1b7A7180c61F4D785064abb666#code)
- DelayModule: [0x701317841664a38F3670a37488E6A798272a197D](https://sepolia.etherscan.io/address/0x701317841664a38F3670a37488E6A798272a197D#code)
- BondingCurve: [0xFcddB2316bCb51CF6E19f21f3551BE634971819b](https://sepolia.etherscan.io/address/0xFcddB2316bCb51CF6E19f21f3551BE634971819b#code)
- AICO Implementation: [0x63E17b8b5ea3C24D61A3797D4fe070ba43602575](https://sepolia.etherscan.io/address/0x63E17b8b5ea3C24D61A3797D4fe070ba43602575#code)
- AICOGovernor Implementation: [0x5AC19de45486d39a57813211D809a6E631B01b5f](https://sepolia.etherscan.io/address/0x5AC19de45486d39a57813211D809a6E631B01b5f#code)
- AICOFactoryImpl: [0xFa0Bf1850536DaF35b72DD72fdaB9EE0B507016C](https://sepolia.etherscan.io/address/0xFa0Bf1850536DaF35b72DD72fdaB9EE0B507016C#code)
- AICOFactory: [0x15fE485c1D8f6e41BD095BDf2b6Ec858d15C8bFb](https://sepolia.etherscan.io/address/0x15fE485c1D8f6e41BD095BDf2b6Ec858d15C8bFb#code)

## Deployment Configuration

### DelayModule
- Delay Duration: 86400 (24 hours in seconds)
- Veto Contract: Points to `0xd87e8e5baAbB3e1b7A7180c61F4D785064abb666`

### AICO Implementation
- Protocol Fee Recipient: `0x82fED030C262ec0262624aaD0a17A0d1eDA24EA1`
- Protocol Rewards: `0xcFfA695ed8b028d68EA3C8040e052192DE3f4da0`
- WETH: `0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9`
- Pool Creation Subsidy: `0x081d7bAd34a8D6B738b225496b62934ef23E4DC1`
- Uniswap V2 Factory: `0xc35DADB65012eC5796536bD9864eD8773aBc74C4`

### AICOFactory
- Owner: `0x82fED030C262ec0262624aaD0a17A0d1eDA24EA1`
- Implementation References:
  - AICO: `0x63E17b8b5ea3C24D61A3797D4fe070ba43602575`
  - AICOGovernor: `0x5AC19de45486d39a57813211D809a6E631B01b5f`
  - BondingCurve: `0xFcddB2316bCb51CF6E19f21f3551BE634971819b`
  - PoolCreationSubsidy: `0x081d7bAd34a8D6B738b225496b62934ef23E4DC1`
- Protocol Configuration:
  - BAG Token: `0x780DB7650ef1F50d949CB56400eE03052C7853CC`
  - Protocol Fee Recipient: `0x82fED030C262ec0262624aaD0a17A0d1eDA24EA1`
  - Protocol Rewards: `0xcFfA695ed8b028d68EA3C8040e052192DE3f4da0`
  - WETH: `0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9`

## Deployment Info

### Core Dependencies
- BAG Token Proxy: `0x780DB7650ef1F50d949CB56400eE03052C7853CC`
- Uniswap V2 Factory: `0xc35DADB65012eC5796536bD9864eD8773aBc74C4`
- WETH: `0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9`
- Protocol Rewards: `0xcFfA695ed8b028d68EA3C8040e052192DE3f4da0`
- Pool Creation Subsidy: `0x081d7bAd34a8D6B738b225496b62934ef23E4DC1`

### Core Contracts
- BondingCurve: `0xFCCbB4961469404a77CE21A592CAea2C591a913E`
  - Parameters: A = 1.06 BAG, B = 0.023 BAG
- AICO Implementation: `0x994C0766Ce597d420926739323560d35B4B8330a`
- AICOFactory: `0x43A1CA8c1C2F8d161588D5bE81ab101Ee01CeE3b`

### Governance Contracts
- AICO Governor Implementation: `0x5AC19de45486d39a57813211D809a6E631B01b5f`
- Delay Module: `0x701317841664a38F3670a37488E6A798272a197D`

### Pending Verification
- BondingCurve: `0xFCCbB4961469404a77CE21A592CAea2C591a913E`
- AICO Implementation: `0x994C0766Ce597d420926739323560d35B4B8330a`
- AICOFactory: `0x43A1CA8c1C2F8d161588D5bE81ab101Ee01CeE3b`

### Deployment Configuration
- Owner: `0x82fED030C262ec0262624aaD0a17A0d1eDA24EA1`
- Network: Sepolia
- Timestamp: 2024-03-19 12:00:00 UTC 