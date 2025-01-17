const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Contract addresses
    const BAG_TOKEN = "0x780DB7650ef1F50d949CB56400eE03052C7853CC";  // New BAG token proxy address
    const WETH = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";  // Sepolia WETH
    const UNISWAP_V2_FACTORY = "0xc35DADB65012eC5796536bD9864eD8773aBc74C4";  // Sepolia Uniswap V2 Factory

    // Deploy BondingCurve
    console.log("\nDeploying BondingCurve...");
    const BondingCurve = await ethers.getContractFactory("BondingCurve");
    const bondingCurve = await upgrades.deployProxy(
        BondingCurve,
        [deployer.address],  // initializer arg
        { 
            initializer: "initialize",
            kind: "uups",
            constructorArgs: [BAG_TOKEN]  // constructor arg
        }
    );
    await bondingCurve.waitForDeployment();
    console.log("BondingCurve deployed to:", await bondingCurve.getAddress());

    // Deploy PoolCreationSubsidy
    console.log("\nDeploying PoolCreationSubsidy...");
    const PoolCreationSubsidy = await ethers.getContractFactory("PoolCreationSubsidy");
    const poolCreationSubsidy = await upgrades.deployProxy(
        PoolCreationSubsidy,
        [BAG_TOKEN, deployer.address],
        { initializer: "initialize", kind: "uups" }
    );
    await poolCreationSubsidy.waitForDeployment();
    console.log("PoolCreationSubsidy deployed to:", await poolCreationSubsidy.getAddress());

    // Deploy AICO Implementation
    console.log("\nDeploying AICO Implementation...");
    const AICO = await ethers.getContractFactory("AICO");
    const aicoImpl = await AICO.deploy();
    await aicoImpl.waitForDeployment();
    console.log("AICO Implementation deployed to:", await aicoImpl.getAddress());

    // Deploy AICOGovernor Implementation
    console.log("\nDeploying AICOGovernor Implementation...");
    const AICOGovernor = await ethers.getContractFactory("AICOGovernor");
    const aicoGovernorImpl = await AICOGovernor.deploy();
    await aicoGovernorImpl.waitForDeployment();
    console.log("AICOGovernor Implementation deployed to:", await aicoGovernorImpl.getAddress());

    // Deploy AICOFactory Implementation
    console.log("\nDeploying AICOFactory...");
    const AICOFactory = await ethers.getContractFactory("AICOFactoryImpl");
    const aicoFactory = await upgrades.deployProxy(AICOFactory, [
        deployer.address, // _owner
        await aicoImpl.getAddress(), // _tokenImplementation
        await aicoGovernorImpl.getAddress(), // _governorImplementation
        await bondingCurve.getAddress(), // _bondingCurve
        await poolCreationSubsidy.getAddress(), // _poolCreationSubsidy
        UNISWAP_V2_FACTORY, // _uniswapV2Factory
        BAG_TOKEN, // _bagToken
        deployer.address, // _protocolFeeRecipient
        deployer.address, // _protocolRewards
        WETH // _weth
    ], {
        initializer: "initialize",
        kind: "uups"
    });
    await aicoFactory.waitForDeployment();
    console.log("AICOFactory deployed to:", await aicoFactory.getAddress());

    // Wait before verification
    console.log("\nWaiting 30 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Verify all contracts
    try {
        // Verify BondingCurve implementation
        const bondingCurveImpl = await upgrades.erc1967.getImplementationAddress(await bondingCurve.getAddress());
        await hre.run("verify:verify", {
            address: bondingCurveImpl,
            constructorArguments: [BAG_TOKEN]
        });

        // Verify PoolCreationSubsidy implementation
        const subsidyImpl = await upgrades.erc1967.getImplementationAddress(await poolCreationSubsidy.getAddress());
        await hre.run("verify:verify", {
            address: subsidyImpl,
            constructorArguments: []
        });

        // Verify AICO implementation
        await hre.run("verify:verify", {
            address: await aicoImpl.getAddress(),
            constructorArguments: []
        });

        // Verify AICOGovernor implementation
        await hre.run("verify:verify", {
            address: await aicoGovernorImpl.getAddress(),
            constructorArguments: []
        });

        // Verify AICOFactory implementation
        const factoryImpl = await upgrades.erc1967.getImplementationAddress(await aicoFactory.getAddress());
        await hre.run("verify:verify", {
            address: factoryImpl,
            constructorArguments: []
        });

        console.log("All implementations verified successfully");
    } catch (error) {
        console.error("Error during verification:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 