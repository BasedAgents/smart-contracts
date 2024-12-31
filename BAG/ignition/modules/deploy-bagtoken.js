const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // 1. Grab the contract factory
  const BAGTokenFactory = await ethers.getContractFactory("BAGToken");
  console.log("Deploying BAGToken...");

  // 2. Deploy a UUPS proxy
  //    Pass parameters for `initialize(...)`: _name, _symbol, _owner
  const bagToken = await upgrades.deployProxy(
    BAGTokenFactory,
    ["BAG Token", "BAG", "0x915E602d1e8960218C54D05f214eDDf5D875d80d"], // Updated owner address
    {
      initializer: "initialize",
      kind: "uups",
    }
  );

  // Wait for the deployment transaction to be mined
  await bagToken.waitForDeployment();
  
  const bagTokenAddress = await bagToken.getAddress();
  console.log("BAGToken deployed to:", bagTokenAddress);
  
  // Get implementation and admin addresses
  console.log("Implementation address:", await upgrades.erc1967.getImplementationAddress(bagTokenAddress));
  console.log("Admin address:", await upgrades.erc1967.getAdminAddress(bagTokenAddress));

  // Optional: read totalSupply
  const supply = await bagToken.totalSupply();
  console.log("Initial supply is:", ethers.formatUnits(supply, 18), "BAG");

  console.log("\nVerification command:");
  console.log(`npx hardhat verify --network base ${await upgrades.erc1967.getImplementationAddress(bagTokenAddress)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});