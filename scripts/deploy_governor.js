const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying AICOGovernor Implementation with account:", deployer.address);

    // Deploy AICOGovernor Implementation
    console.log("\nDeploying AICOGovernor Implementation...");
    const AICOGovernor = await ethers.getContractFactory("AICOGovernor");
    const aicoGovernorImpl = await AICOGovernor.deploy();
    await aicoGovernorImpl.waitForDeployment();
    console.log("AICOGovernor Implementation deployed to:", await aicoGovernorImpl.getAddress());

    // Wait a few blocks before verification
    console.log("\nWaiting 30 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Verify the implementation
    try {
        await hre.run("verify:verify", {
            address: await aicoGovernorImpl.getAddress(),
            constructorArguments: []
        });
        console.log("AICOGovernor implementation verified");
    } catch (error) {
        console.error("Error verifying AICOGovernor:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 