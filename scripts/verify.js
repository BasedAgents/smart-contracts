const { run } = require("hardhat");

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const contracts = {
    MockBAGToken: {
      address: "0x892b7C6AD9B133Da227f29d225d20b83b6A183E2",
      constructorArgs: ["BAG Token", "BAG"]
    },
    BondingCurve: {
      address: "0x56bE02Fe449a99541F72F2c5de5Acf057FB75fdd",
      constructorArgs: [],
      proxy: true
    },
    PoolCreationSubsidy: {
      address: "0x3893Ae87c6d29c0cf950b51Cfc37893fDDf466dc",
      constructorArgs: [],
      proxy: true
    },
    ProtocolRewards: {
      address: "0xB1D6CB77cEAaad81b78c40d956e1968079D2226E",
      constructorArgs: []
    },
    AICO: {
      address: "0x3FdCf8FfE1C247e4809Da3B4b55F7eDF5AeDa203",
      constructorArgs: []
    },
    AICOFactory: {
      address: "0x7c17dC069ff5Ac2E7F2747Ad95708Df3faC487A1",
      constructorArgs: ["0x3FdCf8FfE1C247e4809Da3B4b55F7eDF5AeDa203", "0x"]
    },
    AICOGovernorImpl: {
      address: "0xf9E60683A815a21F0677d6A0d89AcF63f3f5fF01",
      constructorArgs: [],
      proxy: true
    },
    AICOFactoryImpl: {
      address: "0x256B6875AA81D283387312eb6665C653499328A9",
      constructorArgs: [],
      proxy: true
    }
  };

  console.log("Starting contract verification...");

  for (const [name, contract] of Object.entries(contracts)) {
    try {
      console.log(`Verifying ${name}...`);
      
      if (contract.proxy) {
        console.log(`${name} is a proxy contract, verifying implementation...`);
        // For proxy contracts, we verify without constructor arguments
        await run("verify:verify", {
          address: contract.address,
          constructorArguments: []
        });
      } else {
        await run("verify:verify", {
          address: contract.address,
          constructorArguments: contract.constructorArgs
        });
      }
      
      console.log(`${name} verified successfully`);
      
      // Add a delay between verifications to avoid rate limiting
      await delay(30000); // 30 seconds delay
      
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log(`${name} is already verified`);
      } else {
        console.log(`Error verifying ${name}:`, error.message);
      }
      // Still delay even if there's an error
      await delay(30000);
    }
  }

  console.log("Verification complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 