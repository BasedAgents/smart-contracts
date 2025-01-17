require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require("dotenv").config();
let secret = require("./secret");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: {
		compilers: [
			{
				version: "0.8.25",
				settings: {
					viaIR: true,
					optimizer: {
						enabled: true,
						runs: 1000,
						details: {
							yul: true,
							yulDetails: {
								stackAllocation: true,
								optimizerSteps: "dhfoDgvulfnTUtnIf"
							}
						}
					}
				}
			},
			{
				version: "0.8.23",
				settings: {
					viaIR: true,
					optimizer: {
						enabled: true,
						runs: 1000,
						details: {
							yul: true,
							yulDetails: {
								stackAllocation: true,
								optimizerSteps: "dhfoDgvulfnTUtnIf"
							}
						}
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
		sepolia: {
			url: secret.url,
			accounts: [secret.key],
			chainId: 11155111
		}
	},
	etherscan: {
		apiKey: {
			mainnet: secret.etherscan,
			sepolia: secret.etherscan
		}
	}
};