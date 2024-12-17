const path = require('path');
const envPath = path.join(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

require('hardhat-deploy');
require('hardhat-contract-sizer');
require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
let secret = require("./secret");
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
	networks: {
		hardhat: {
			forking:{
				url: secret.url,
			},
		},
		localhost: {
			url: "http://127.0.0.1:8545"
		},
		sepolia: {
			url: secret.url,
			accounts: [
				// YOUR PRIVATE KEY HERE
				secret.key,
				secret.test
			  ]
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
						runs: 200
					}
				  }
			},
			{
				version: "0.4.18",
				settings: {
          viaIR: true,
					optimizer: {
						enabled: true,
						runs: 200
					}
				  }
			},
			{
				version: "0.7.6",
				settings: {
          viaIR: true,
					optimizer: {
						enabled: true,
						runs: 200
					}
				  }
			},
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
		apiKey: process.env.SEPOLIA_API_KEY
	},

	contractSizer: {
		alphaSort: true,
		runOnCompile: true,
		disambiguatePaths: false,
	}
};