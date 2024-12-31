const { ethers, upgrades } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying BAGGovernor with account:", deployer.address);

    // BAG Token proxy address
    const bagTokenAddress = "0x5bEe1C617721E743e420AB6650BfC808365a0a82"; // Your BAG Token proxy address
    console.log("BAG Token address:", bagTokenAddress);

    // Set proposer address - this could be a multisig or specific address
    const proposerAddress = "0x552375B8BC807F30065Dca9A5828B645D64F53Ab"; // Replace with desired proposer address
    console.log("Proposer address:", proposerAddress);

    // Deploy Governor
    const BAGGovernor = await ethers.getContractFactory("BAGGovernor");
    console.log("Deploying BAGGovernor...");
    
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

    console.log("BAGGovernor deployed to:", governorAddress);
    console.log("Implementation address:", await upgrades.erc1967.getImplementationAddress(governorAddress));
    
    // Log configuration
    console.log("\nGovernance Configuration:");
    console.log("Voting Delay:", await governor.votingDelay(), "seconds");
    console.log("Voting Period:", await governor.votingPeriod(), "seconds");
    console.log("Proposal Threshold:", ethers.formatUnits(await governor.proposalThreshold(), 18), "tokens");
    console.log("Quorum Requirement:", await governor.quorumNumerator(), "%");
    console.log("Proposer Address:", await governor.proposer());

    console.log("\nVerification command:");
    console.log(`npx hardhat verify --network baseSepolia ${await upgrades.erc1967.getImplementationAddress(governorAddress)}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 