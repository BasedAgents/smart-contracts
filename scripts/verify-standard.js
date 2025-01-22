const { run } = require("hardhat");

async function main() {
  const contracts = {
    MockBAGToken: {
      address: "0x892b7C6AD9B133Da227f29d225d20b83b6A183E2",
      constructorArgs: ["BAG Token", "BAG"]
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
    }
  };

  console.log("Starting verification of standard contracts...");

  for (const [name, contract] of Object.entries(contracts)) {
    try {
      console.log(`\nVerifying ${name}...`);
      await run("verify:verify", {
        address: contract.address,
        constructorArguments: contract.constructorArgs
      });
      console.log(`${name} verified successfully`);
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log(`${name} is already verified`);
      } else {
        console.log(`Error verifying ${name}:`, error.message);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 