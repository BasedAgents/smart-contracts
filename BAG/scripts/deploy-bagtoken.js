const { ethers, upgrades } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying BAG Token with account:", deployer.address);

    // Deploy BAG Token
    const BagToken = await ethers.getContractFactory("BagToken");
    console.log("Deploying BAG Token...");
    
    const token = await upgrades.deployProxy(
        BagToken,
        [
            deployer.address,  // initial owner
            ethers.parseEther("1000000000")  // initial supply: 1 billion tokens
        ],
        {
            initializer: "initialize",
            kind: "uups",
        }
    );

    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();

    console.log("\nDeployment Results:");
    console.log("BAG Token proxy deployed to:", tokenAddress);
    console.log("Implementation address:", await upgrades.erc1967.getImplementationAddress(tokenAddress));
    
    // Log configuration
    console.log("\nToken Configuration:");
    console.log("Total Supply:", ethers.formatUnits(await token.totalSupply(), 18), "tokens");
    console.log("Owner:", await token.owner());

    console.log("\nVerification command:");
    console.log(`npx hardhat verify --network base ${await upgrades.erc1967.getImplementationAddress(tokenAddress)}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 