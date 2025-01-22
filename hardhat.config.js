require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: {
		compilers: [
			{
				version: "0.8.20",
				settings: {
					viaIR: true,
					optimizer: {
						enabled: true,
						runs: 200
					}
				}
			},
			{
				version: "0.8.22",
				settings: {
					viaIR: true,
					optimizer: {
						enabled: true,
						runs: 200
					}
				}
			},
			{
				version: "0.8.23",
				settings: {
					viaIR: true,
					optimizer: {
						enabled: true,
						runs: 200
					}
				}
			},
			{
				version: "0.8.25",
				settings: {
					viaIR: true,
					optimizer: {
						enabled: true,
						runs: 200
					}
				}
			}
		]
	},
	paths: {
		sources: "./contracts",
		tests: "./test",
		cache: "./cache",
		artifacts: "./artifacts"
	},
	networks: {
		hardhat: {
			allowUnlimitedContractSize: true
		},
		localhost: {
			url: "http://127.0.0.1:8545"
		},
		sepolia: {
			url: process.env.SEPOLIA_RPC_URL,
			accounts: [process.env.PRIVATE_KEY],
		}
	},
	etherscan: {
		apiKey: process.env.ETHERSCAN_API_KEY
	}
};