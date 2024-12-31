const { ethers, upgrades } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying OptimisticBAGGovernor with account:", deployer.address);

    // BAG Token proxy address
    const bagTokenAddress = "0x5bEe1C617721E743e420AB6650BfC808365a0a82"; // Your BAG Token proxy address
    console.log("BAG Token address:", bagTokenAddress);

    // Deploy OptimisticGovernor
    const OptimisticBAGGovernor = await ethers.getContractFactory("OptimisticBAGGovernor");
    console.log("Deploying OptimisticBAGGovernor...");
    
    const governor = await upgrades.deployProxy(
        OptimisticBAGGovernor,
        [
            bagTokenAddress,    // token address
            deployer.address,   // initial owner
            7 * 24 * 60 * 60,  // liveness period (7 days in seconds)
            ethers.parseEther("100000")  // required bond
        ],
        {
            initializer: "initialize",
            kind: "uups",
        }
    );

    await governor.waitForDeployment();
    const governorAddress = await governor.getAddress();

    console.log("OptimisticBAGGovernor deployed to:", governorAddress);
    console.log("Implementation address:", await upgrades.erc1967.getImplementationAddress(governorAddress));
    
    // Log configuration
    console.log("\nGovernance Configuration:");
    console.log("Liveness Period:", await governor.livenessPeriod(), "seconds");
    console.log("Required Bond:", ethers.formatUnits(await governor.requiredBond(), 18), "tokens");
    console.log("Owner:", await governor.owner());

    console.log("\nVerification command:");
    console.log(`npx hardhat verify --network baseSepolia ${await upgrades.erc1967.getImplementationAddress(governorAddress)}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 