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
  await delay(30000);
}

async function main() {
  // AICO Implementation and Proxy
  const contracts = [
    {
      name: "AICO Implementation",
      address: "0x3dC3005576CbcBC3436f689f35b55cbd7e5e0CeB",
      constructorArgs: []
    },
    {
      name: "AICO Proxy",
      address: "0xd8eBdCBc2f223Cda6F853904bA717a161fC85eDa",
      constructorArgs: ["0x3dC3005576CbcBC3436f689f35b55cbd7e5e0CeB", "0x"]
    }
  ];

  console.log("Starting verification of AICO contracts...");

  for (const contract of contracts) {
    await verifyContract(contract.name, contract.address, contract.constructorArgs);
  }

  console.log("\nVerification process complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 