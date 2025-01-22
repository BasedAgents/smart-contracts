const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Constants
    const BAG_TOKEN = "0x780DB7650ef1F50d949CB56400eE03052C7853CC";
    const UNISWAP_V2_FACTORY = "0xc35DADB65012eC5796536bD9864eD8773aBc74C4";
    const WETH = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";  // Sepolia WETH
    const DELAY_DURATION = 24 * 60 * 60; // 24 hours in seconds

    // Deploy VetoContract
    console.log("\nDeploying VetoContract...");
    const VetoContract = await ethers.getContractFactory("VetoContract");
    const vetoContract = await VetoContract.deploy();
    await vetoContract.waitForDeployment();
    console.log("VetoContract deployed to:", await vetoContract.getAddress());

    // Deploy DelayModule
    console.log("\nDeploying DelayModule...");
    const DelayModule = await ethers.getContractFactory("DelayModule");
    const delayModule = await DelayModule.deploy(await vetoContract.getAddress(), DELAY_DURATION);
    await delayModule.waitForDeployment();
    console.log("DelayModule deployed to:", await delayModule.getAddress());

    // Deploy ProtocolRewards
    console.log("\nDeploying ProtocolRewards...");
    const ProtocolRewards = await ethers.getContractFactory("ProtocolRewards");
    const protocolRewards = await ProtocolRewards.deploy();
    await protocolRewards.waitForDeployment();
    console.log("ProtocolRewards deployed to:", await protocolRewards.getAddress());

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
        [UNISWAP_V2_FACTORY, deployer.address],
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

    // Deploy AICOFactory
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
        await protocolRewards.getAddress(), // _protocolRewards
        WETH // _weth
    ], {
        initializer: "initialize",
        kind: "uups"
    });
    await aicoFactory.waitForDeployment();
    console.log("AICOFactory deployed to:", await aicoFactory.getAddress());

    // Verify contracts
    console.log("\nVerifying contracts on Etherscan...");
    try {
        await hre.run("verify:verify", {
            address: await vetoContract.getAddress(),
            constructorArguments: []
        });
        console.log("VetoContract verified");

        await hre.run("verify:verify", {
            address: await delayModule.getAddress(),
            constructorArguments: [await vetoContract.getAddress(), DELAY_DURATION]
        });
        console.log("DelayModule verified");

        await hre.run("verify:verify", {
            address: await protocolRewards.getAddress(),
            constructorArguments: []
        });
        console.log("ProtocolRewards verified");

        // ... rest of the verifications
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