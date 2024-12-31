const { ethers, upgrades, run } = require("hardhat");

async function main() {
  const proxyAddress = "0x94e0b9638E84a6E5061beb82529582874B12e8c3";
  
  console.log("Verifying proxy contract...");
  
  await run("verify:verify", {
    address: proxyAddress,
    constructorArguments: []
  });

  const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("Implementation address:", implAddress);
  
  await run("verify:verify", {
    address: implAddress,
    constructorArguments: []
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });