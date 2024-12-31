const { ethers, upgrades, run } = require("hardhat");

async function main() {
  const proxyAddress = "0x7fe13fE48dF9c5d8d9897ce1db21C067B1Ffb700";
  const implAddress = "0xd6B8b3cbdE59943A6FD25afFdBe30A303c6E6471";
  
  console.log("Verifying proxy contract...");
  
  // Verify the proxy contract
  try {
    await run("verify:verify", {
      address: proxyAddress,
      constructorArguments: []
    });
  } catch (error) {
    if (!error.message.includes("Already Verified")) {
      throw error;
    }
  }

  console.log("Linking proxy to implementation...");
  try {
    await run("verify:verify", {
      address: implAddress,
      constructorArguments: []
    });
  } catch (error) {
    if (!error.message.includes("Already Verified")) {
      throw error;
    }
  }

  // Print out verification URLs
  console.log("\nVerification complete. Check your contracts at:");
  console.log(`Proxy: https://sepolia.basescan.org/address/${proxyAddress}#code`);
  console.log(`Implementation: https://sepolia.basescan.org/address/${implAddress}#code`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });