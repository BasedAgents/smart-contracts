const { ethers, upgrades } = require("hardhat");

async function main() {
    const GOVERNOR_PROXY = "0xd92Aff2623e93E561A22a627ED9A8FcAfF817d5A";
    const PROPOSER_ADDRESS = "0xAd3483be560a7CE85c4275344d8DED76B47880F6";

    console.log("Getting current implementation address...");
    const oldImpl = await upgrades.erc1967.getImplementationAddress(GOVERNOR_PROXY);
    console.log("Current implementation:", oldImpl);

    console.log("Upgrading BAGGovernor...");
    const BAGGovernor = await ethers.getContractFactory("BAGGovernor");
    
    const upgraded = await upgrades.upgradeProxy(GOVERNOR_PROXY, BAGGovernor);
    await upgraded.waitForDeployment();

    console.log("BAGGovernor upgraded");
    
    const newImpl = await upgrades.erc1967.getImplementationAddress(GOVERNOR_PROXY);
    console.log("New implementation:", newImpl);

    if (oldImpl === newImpl) {
        console.log("Warning: Implementation address didn't change!");
    }

    // Set the proposer
    console.log("Setting proposer to:", PROPOSER_ADDRESS);
    const tx = await upgraded.setProposer(PROPOSER_ADDRESS);
    await tx.wait();
    console.log("Proposer set successfully");

    // Try to read the proposer
    try {
        const proposer = await upgraded.getProposer();
        console.log("Current proposer:", proposer);
    } catch (error) {
        console.error("Could not read proposer:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });