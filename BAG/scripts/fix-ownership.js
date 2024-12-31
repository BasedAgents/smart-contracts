const { ethers } = require("hardhat");

async function main() {
    const GOVERNOR_ADDRESS = "0xFE928a45505310c877f0de9E70E3E9Cae4FDCcE"; // Your governor proxy address
    const DESIRED_OWNER = "0x552375B8BC807F30065Dca9A5828B645D64F53Ab";
    
    console.log("Connecting to governor...");
    const governor = await ethers.getContractAt("BAGGovernor", GOVERNOR_ADDRESS);
    
    console.log("Current owner:", await governor.owner());
    console.log("Transferring ownership to:", DESIRED_OWNER);
    
    const tx = await governor.forceTransferOwnership(DESIRED_OWNER);
    await tx.wait();
    
    console.log("New owner:", await governor.owner());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 