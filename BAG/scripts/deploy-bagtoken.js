const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying BAG Token with account:", deployer.address);

    // Deploy BAG Token as upgradeable
    console.log("\nDeploying BAG Token...");
    const BAGToken = await ethers.getContractFactory("BAGToken");
    const bagToken = await upgrades.deployProxy(
        BAGToken,
        ["BAG Token", "BAG", deployer.address],
        { 
            initializer: "initialize",
            kind: "uups"
        }
    );
    await bagToken.waitForDeployment();
    const bagTokenAddress = await bagToken.getAddress();
    console.log("BAG Token proxy deployed to:", bagTokenAddress);

    // Get implementation address
    const implAddress = await upgrades.erc1967.getImplementationAddress(bagTokenAddress);
    console.log("BAG Token implementation deployed to:", implAddress);

    // Verify owner and total supply
    const owner = await bagToken.owner();
    const totalSupply = await bagToken.totalSupply();
    console.log("\nContract State:");
    console.log("Owner:", owner);
    console.log("Total Supply:", ethers.formatUnits(totalSupply, 18), "BAG");
    
    if (owner === ethers.ZeroAddress) {
        console.error("ERROR: Owner is set to zero address!");
        return;
    }

    // Wait a few blocks before verification
    console.log("\nWaiting 30 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Verify the implementation
    try {
        await hre.run("verify:verify", {
            address: implAddress,
            constructorArguments: []
        });
        console.log("BAG Token implementation verified");
    } catch (error) {
        console.error("Error verifying BAG Token:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 