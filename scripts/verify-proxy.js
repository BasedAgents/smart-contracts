const { run } = require("hardhat");

async function main() {
  const contracts = {
    BondingCurve: {
      address: "0x56bE02Fe449a99541F72F2c5de5Acf057FB75fdd"
    },
    PoolCreationSubsidy: {
      address: "0x3893Ae87c6d29c0cf950b51Cfc37893fDDf466dc"
    },
    AICOGovernorImpl: {
      address: "0xf9E60683A815a21F0677d6A0d89AcF63f3f5fF01"
    },
    AICOFactoryImpl: {
      address: "0x256B6875AA81D283387312eb6665C653499328A9"
    }
  };

  console.log("Starting verification of proxy contracts...");

  for (const [name, contract] of Object.entries(contracts)) {
    try {
      console.log(`\nVerifying ${name}...`);
      await run("verify:verify", {
        address: contract.address,
        constructorArguments: []
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