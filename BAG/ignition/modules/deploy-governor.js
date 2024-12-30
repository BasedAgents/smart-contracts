const { ethers, upgrades } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("\nDeployment Configuration:");
    console.log("Deployer address:", deployer.address);
    console.log("BAG Token address:", bagTokenAddress);
    console.log("Proposer address:", proposerAddress);
    console.log("Initial Owner address (deployer):", deployer.address);

    // Deploy Governor
    const BAGGovernor = await ethers.getContractFactory("BAGGovernor");
    console.log("\nDeploying BAGGovernor...");
    
    const governor = await upgrades.deployProxy(
        BAGGovernor,
        [
            bagTokenAddress,   // token address
            deployer.address,  // initial owner
            proposerAddress    // proposer address
        ],
        {
            initializer: "initialize",
            kind: "uups",
        }
    );

    await governor.waitForDeployment();
    const governorAddress = await governor.getAddress();

    console.log("\nDeployment Results:");
    console.log("BAGGovernor proxy deployed to:", governorAddress);
    console.log("Implementation address:", await upgrades.erc1967.getImplementationAddress(governorAddress));
    
    // Verify ownership
    const owner = await governor.owner();
    console.log("\nOwnership Verification:");
    console.log("Owner address:", owner);
    console.log("Expected owner:", deployer.address);
    console.log("Owner is correct:", owner === deployer.address);
    
    // Rest of your logging...
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});