const { ethers } = require("hardhat");

async function main() {
    const GOVERNOR_PROXY = "0xd92Aff2623e93E561A22a627ED9A8FcAfF817d5A";
    const PROPOSER_ADDRESS = "0xAd3483be560a7CE85c4275344d8DED76B47880F6";
    const IMPLEMENTATION = "0xf6Fd13B0d1aa7427f251845f91c2Fa903D8E2F85"; // The implementation we verified earlier

    console.log("Connecting to proxy...");
    const governor = await ethers.getContractAt("BAGGovernor", GOVERNOR_PROXY);

    console.log("Setting proposer to:", PROPOSER_ADDRESS);
    const tx = await governor.setProposer(PROPOSER_ADDRESS);
    await tx.wait();
    console.log("Proposer set successfully");

    const proposer = await governor.getProposer();
    console.log("Current proposer:", proposer);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 