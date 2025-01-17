const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying Phase 1 contracts with account:", deployer.address);
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    // Deploy BondingCurve
    console.log("\nDeploying BondingCurve...");
    const BondingCurve = await ethers.getContractFactory("BondingCurve");
    const bondingCurve = await BondingCurve.deploy();
    await bondingCurve.deployed();
    console.log("BondingCurve deployed to:", bondingCurve.address);

    // Deploy PoolCreationSubsidy
    console.log("\nDeploying PoolCreationSubsidy...");
    const PoolCreationSubsidy = await ethers.getContractFactory("PoolCreationSubsidy");
    const poolCreationSubsidy = await PoolCreationSubsidy.deploy();
    await poolCreationSubsidy.deployed();
    console.log("PoolCreationSubsidy deployed to:", poolCreationSubsidy.address);

    // Deploy AICO Implementation
    console.log("\nDeploying AICO Implementation...");
    const AICO = await ethers.getContractFactory("AICO");
    const aicoImpl = await AICO.deploy();
    await aicoImpl.deployed();
    console.log("AICO Implementation deployed to:", aicoImpl.address);

    // Deploy AICOFactory
    console.log("\nDeploying AICOFactory...");
    const AICOFactory = await ethers.getContractFactory("AICOFactory");
    const aicoFactory = await AICOFactory.deploy(
        aicoImpl.address,
        bondingCurve.address,
        poolCreationSubsidy.address
    );
    await aicoFactory.deployed();
    console.log("AICOFactory deployed to:", aicoFactory.address);

    // Verify contracts on Etherscan
    console.log("\nVerifying contracts on Etherscan...");
    await hre.run("verify:verify", {
        address: bondingCurve.address,
        constructorArguments: []
    });

    await hre.run("verify:verify", {
        address: poolCreationSubsidy.address,
        constructorArguments: []
    });

    await hre.run("verify:verify", {
        address: aicoImpl.address,
        constructorArguments: []
    });

    await hre.run("verify:verify", {
        address: aicoFactory.address,
        constructorArguments: [
            aicoImpl.address,
            bondingCurve.address,
            poolCreationSubsidy.address
        ]
    });

    console.log("\nPhase 1 Deployment Complete!");
    console.log("--------------------");
    console.log("BondingCurve:", bondingCurve.address);
    console.log("PoolCreationSubsidy:", poolCreationSubsidy.address);
    console.log("AICO Implementation:", aicoImpl.address);
    console.log("AICOFactory:", aicoFactory.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 