const { run } = require("hardhat");

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verifyContract(name, address, constructorArgs = []) {
  try {
    console.log(`\nVerifying ${name}...`);
    await run("verify:verify", {
      address: address,
      constructorArguments: constructorArgs
    });
    console.log(`${name} verified successfully`);
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log(`${name} is already verified`);
    } else {
      console.log(`Error verifying ${name}:`, error.message);
    }
  }
  // Wait between verifications
  await delay(30000);
}

async function main() {
  const contracts = [
    {
      name: "BondingCurve",
      address: "0xdcC56e42d8636CF34454dDE4291244842d722267"
    },
    {
      name: "PoolCreationSubsidy",
      address: "0x3B92BC685D326CbE82d1AC389ae0f396Bab95D12"
    },
    {
      name: "AICO Implementation",
      address: "0x3dC3005576CbcBC3436f689f35b55cbd7e5e0CeB"
    },
    {
      name: "AICO Proxy",
      address: "0xd8eBdCBc2f223Cda6F853904bA717a161fC85eDa",
      constructorArgs: ["0x3dC3005576CbcBC3436f689f35b55cbd7e5e0CeB", "0x"]
    },
    {
      name: "AICOGovernorImpl",
      address: "0xA7944b53c6814dd9F72ef48FE260beC41AE14069"
    },
    {
      name: "AICOFactoryImpl",
      address: "0xd25F32FBfADa4b292B3066070ABA5428911e6fB4"
    }
  ];

  console.log("Starting verification of remaining contracts...");

  for (const contract of contracts) {
    await verifyContract(contract.name, contract.address, contract.constructorArgs || []);
  }

  console.log("\nVerification process complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 