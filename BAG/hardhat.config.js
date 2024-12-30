require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.23",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  networks: {
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      urls: [
        process.env.BASE_SEPOLIA_RPC_URL,
        "https://sepolia.base.org",
        "https://base-sepolia.blockpi.network/v1/rpc/public",
        "https://1rpc.io/base-sepolia",
        "https://base-sepolia-rpc.publicnode.com"
      ].filter(url => url), // Remove null/undefined values
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
      timeout: 60000, // Increase timeout to 60 seconds
      verify: {
        etherscan: {
          apiUrl: "https://api-sepolia.basescan.org/api"
        }
      }
    }
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.ETHERSCAN_API_KEY
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      }
    ]
  },
  mocha: {
    timeout: 100000 // Increase test timeout
  }
};