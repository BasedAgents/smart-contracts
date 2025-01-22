const { run } = require("hardhat");

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verifyContract(name, address) {
  try {
    console.log(`\nVerifying ${name}...`);
    await run("verify:verify", {
      address: address,
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
  // Wait between verifications
  await delay(30000);
}

async function main() {
  // Implementation addresses (found from the proxy contracts)
  const implementations = [
    {
      name: "BondingCurve Implementation",
      address: "0x7D3a3Fea038e023Dc74201e26D618C3e1FFCfB68"
    },
    {
      name: "PoolCreationSubsidy Implementation",
      address: "0x3B92BC685D326CbE82d1AC389ae0f396Bab95D12"
    },
    {
      name: "AICOGovernorImpl Implementation",
      address: "0xA7944b53c6814dd9F72ef48FE260beC41AE14069"
    },
    {
      name: "AICOFactoryImpl Implementation",
      address: "0xd25F32FBfADa4b292B3066070ABA5428911e6fB4"
    }
  ];

  console.log("Starting verification of implementation contracts...");

  for (const contract of implementations) {
    await verifyContract(contract.name, contract.address);
  }

  console.log("\nVerification process complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 