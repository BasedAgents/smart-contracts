const { ethers } = require("hardhat");

async function main() {
    const governorAddress = "0xd92Aff2623e93E561A22a627ED9A8FcAfF817d5A";
    const BAGGovernor = await ethers.getContractFactory("BAGGovernor");
    const governor = BAGGovernor.attach(governorAddress);

    try {
        const proposer = await governor.getProposer();
        console.log("Proposer address:", proposer);
        
        // Also check the version
        const version = await governor.VERSION();
        console.log("Contract version:", version.toString());
    } catch (error) {
        console.error("Error reading contract:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 