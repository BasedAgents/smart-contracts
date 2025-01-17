require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
let secret = require("./secret");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
	networks: {
		hardhat: {
			forking: {
				url: secret.url,
			},
		},
		localhost: {
			url: "http://127.0.0.1:8545"
		},
		sepolia: {
			url: secret.url,
			accounts: [secret.key]
		},
	},
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
			}
		],
	},
	paths: {
		sources: "./contracts",
		tests: "./test",
		cache: "./cache",
		artifacts: "./artifacts"
	},
	mocha: {
		timeout: 500000
	},
	etherscan: {
		apiKey: {
			mainnet: secret.etherscan,
			sepolia: secret.etherscan
		}
	}
};