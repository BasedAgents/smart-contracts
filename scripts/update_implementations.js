const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Updating implementations with account:", deployer.address);

    // Factory proxy address from previous deployment
    const FACTORY_PROXY = "0x148eea31e41371eFf65E9816a8d95Fc936DDF2E6";

    // Deploy new AICO Implementation
    console.log("\nDeploying new AICO Implementation...");
    const AICO = await ethers.getContractFactory("AICO");
    const aicoImpl = await AICO.deploy();
    await aicoImpl.waitForDeployment();
    console.log("New AICO Implementation deployed to:", await aicoImpl.getAddress());

    // Get Factory contract
    console.log("\nUpdating Factory implementation addresses...");
    const factory = await ethers.getContractAt("AICOFactoryImpl", FACTORY_PROXY);
    
    // Update the implementation address in the factory
    const updateTx = await factory.updateContractAddresses(
        await aicoImpl.getAddress(), // new AICO implementation
        await factory.governorImplementation(), // keep existing governor implementation
        await factory.bondingCurve(),
        await factory.poolCreationSubsidy(),
        await factory.uniswapV2Factory(),
        await factory.BAG(),
        await factory.protocolFeeRecipient(),
        await factory.protocolRewards(),
        await factory.WETH()
    );
    
    await updateTx.wait();
    console.log("Factory updated with new implementation addresses");

    // Verify the new implementation
    console.log("\nVerifying new implementation on Etherscan...");
    try {
        await hre.run("verify:verify", {
            address: await aicoImpl.getAddress(),
            constructorArguments: []
        });
        console.log("New AICO implementation verified");
    } catch (error) {
        console.error("Error verifying implementation:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 