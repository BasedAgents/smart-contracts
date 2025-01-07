const hre = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Deploy VetoContract
    const VetoContract = await ethers.getContractFactory("VetoContract");
    const vetoContract = await VetoContract.deploy();
    await vetoContract.deployed();
    console.log("VetoContract deployed to:", vetoContract.address);

    // Deploy DelayModule with 1 day delay
    const ONE_DAY = 24 * 60 * 60; // 1 day in seconds
    const DelayModule = await ethers.getContractFactory("DelayModule");
    const delayModule = await DelayModule.deploy(vetoContract.address, ONE_DAY);
    await delayModule.deployed();
    console.log("DelayModule deployed to:", delayModule.address);

    // Verify contracts on Etherscan
    if (hre.network.name !== "hardhat") {
        console.log("Waiting for block confirmations...");
        await vetoContract.deployTransaction.wait(6);
        await delayModule.deployTransaction.wait(6);

        await hre.run("verify:verify", {
            address: vetoContract.address,
            constructorArguments: []
        });

        await hre.run("verify:verify", {
            address: delayModule.address,
            constructorArguments: [vetoContract.address, ONE_DAY]
        });
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 