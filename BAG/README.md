# BAG Protocol

This repository contains the smart contracts for the BAG Protocol governance system.

## Deployed Contracts (Base Sepolia)

| Contract | Address | Description |
|----------|---------|-------------|
| BAG Token (Proxy) | `0x5bEe1C617721E743e420AB6650BfC808365a0a82` | The governance token |
| BAG Token (Implementation) | `0x78d1ceECc99b691f4aE95aEe5Af3042287e55857` | The token implementation |
| BAGGovernor (Proxy) | `0x7fe13fE48dF9c5d8d9897ce1db21C067B1Ffb700` | The governance contract |
| BAGGovernor (Implementation) | `0xd6B8b3cbdE59943A6FD25afFdBe30A303c6E6471` | The governance implementation |

You can view these contracts on [Base Sepolia Explorer](https://sepolia.basescan.org/).

## Development Setup

1. Clone the repository
```bash
git clone <repository-url>
cd BAG
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file with the following variables:
```
PRIVATE_KEY=your_private_key
BASE_SEPOLIA_RPC_URL=your_base_sepolia_rpc_url
BASESCAN_API_KEY=your_basescan_api_key
```

4. Compile the contracts
```bash
npx hardhat compile
```

## Deployment Steps

1. Deploy the BAG Token:
```bash
npx hardhat run scripts/deploy-bagtoken.js --network base
```

2. Deploy the Governor:
```bash
npx hardhat run scripts/deploy-governor.js --network base
```

3. Verify the contracts:
```bash
npx hardhat run scripts/verify-proxy.js --network base
npx hardhat run scripts/verify-governor.js --network base
```

## Governance Parameters

The BAGGovernor is configured with the following parameters:
- Voting Delay: 5 minutes
- Voting Period: 10 minutes
- Proposal Threshold: 0 (restricted by proposer address)
- Quorum Requirement: 4%

## Contract Verification

All contracts are verified on Base Explorer. You can interact with them directly through the explorer:
- [BAG Token Proxy](https://sepolia.basescan.org/address/0x5bEe1C617721E743e420AB6650BfC808365a0a82#code)
- [BAG Token Implementation](https://sepolia.basescan.org/address/0x78d1ceECc99b691f4aE95aEe5Af3042287e55857#code)
- [BAGGovernor Proxy](https://sepolia.basescan.org/address/0x7fe13fE48dF9c5d8d9897ce1db21C067B1Ffb700#code)
- [BAGGovernor Implementation](https://sepolia.basescan.org/address/0xd6B8b3cbdE59943A6FD25afFdBe30A303c6E6471#code)

## Security

- All contracts use OpenZeppelin's upgradeable contracts
- Governance is protected by a proposer role
- Contracts are upgradeable using the UUPS pattern
