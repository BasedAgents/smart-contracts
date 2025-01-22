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
  const contracts = [
    {
      name: "AICOGovernorImpl",
      address: "0xA7944b53c6814dd9F72ef48FE260beC41AE14069",
      constructorArgs: []
    },
    {
      name: "AICOFactoryImpl",
      address: "0xd25F32FBfADa4b292B3066070ABA5428911e6fB4",
      constructorArgs: []
    }
  ];

  console.log("Starting verification of remaining contracts...");

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