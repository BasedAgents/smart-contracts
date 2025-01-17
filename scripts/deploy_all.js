const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Constants
    const BAG_TOKEN = "0xCafEb3Dd19F644F06023C9064F8fd1f87Ac95e0A";  // Sepolia BAG token address
    const WETH = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";      // Sepolia WETH
    const UNISWAP_V2_FACTORY = "0xc35DADB65012eC5796536bD9864eD8773aBc74C4"; // Sepolia Uniswap V2 Factory address
    const PROTOCOL_FEE_RECIPIENT = deployer.address; // Protocol fee recipient (deployer for now)
    const DELAY_DURATION = 86400; // 24 hours in seconds

    // Deploy VetoContract
    console.log("\nDeploying VetoContract...");
    const VetoContract = await ethers.getContractFactory("VetoContract");
    const vetoContract = await VetoContract.deploy();
    await vetoContract.waitForDeployment();
    console.log("VetoContract deployed to:", await vetoContract.getAddress());

    // Deploy DelayModule
    console.log("\nDeploying DelayModule...");
    const DelayModule = await ethers.getContractFactory("DelayModule");
    const delayModule = await DelayModule.deploy(
        await vetoContract.getAddress(),
        DELAY_DURATION
    );
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
        [deployer.address],
        {
            kind: "uups",
            constructorArgs: [BAG_TOKEN],
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
        {
            kind: "uups",
        }
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
    console.log("\nDeploying AICOFactory Implementation...");
    const AICOFactory = await ethers.getContractFactory("AICOFactoryImpl");
    const aicoFactory = await upgrades.deployProxy(
        AICOFactory,
        [
            deployer.address,
            await aicoImpl.getAddress(),
            await aicoGovernorImpl.getAddress(),
            await bondingCurve.getAddress(),
            await poolCreationSubsidy.getAddress(),
            UNISWAP_V2_FACTORY,
            BAG_TOKEN,
            PROTOCOL_FEE_RECIPIENT,
            await protocolRewards.getAddress(),
            WETH
        ],
        {
            kind: "uups",
        }
    );
    await aicoFactory.waitForDeployment();
    console.log("AICOFactory deployed to:", await aicoFactory.getAddress());

    // Verify contracts on Etherscan
    console.log("\nVerifying contracts on Etherscan...");
    
    // Wait for a few blocks before verification
    await new Promise(resolve => setTimeout(resolve, 30000));

    try {
        await hre.run("verify:verify", {
            address: await vetoContract.getAddress(),
            constructorArguments: [],
        });
        console.log("VetoContract verified");
    } catch (error) {
        console.error("Error verifying VetoContract:", error);
    }

    try {
        await hre.run("verify:verify", {
            address: await delayModule.getAddress(),
            constructorArguments: [await vetoContract.getAddress(), DELAY_DURATION],
        });
        console.log("DelayModule verified");
    } catch (error) {
        console.error("Error verifying DelayModule:", error);
    }

    try {
        await hre.run("verify:verify", {
            address: await protocolRewards.getAddress(),
            constructorArguments: [],
        });
        console.log("ProtocolRewards verified");
    } catch (error) {
        console.error("Error verifying ProtocolRewards:", error);
    }

    try {
        await hre.run("verify:verify", {
            address: await upgrades.erc1967.getImplementationAddress(await bondingCurve.getAddress()),
            constructorArguments: [BAG_TOKEN],
        });
        console.log("BondingCurve implementation verified");
    } catch (error) {
        console.error("Error verifying BondingCurve:", error);
    }

    try {
        await hre.run("verify:verify", {
            address: await upgrades.erc1967.getImplementationAddress(await poolCreationSubsidy.getAddress()),
            constructorArguments: [],
        });
        console.log("PoolCreationSubsidy implementation verified");
    } catch (error) {
        console.error("Error verifying PoolCreationSubsidy:", error);
    }

    try {
        await hre.run("verify:verify", {
            address: await aicoImpl.getAddress(),
            constructorArguments: [],
        });
        console.log("AICO implementation verified");
    } catch (error) {
        console.error("Error verifying AICO:", error);
    }

    try {
        await hre.run("verify:verify", {
            address: await aicoGovernorImpl.getAddress(),
            constructorArguments: [],
        });
        console.log("AICOGovernor implementation verified");
    } catch (error) {
        console.error("Error verifying AICOGovernor:", error);
    }

    try {
        await hre.run("verify:verify", {
            address: await upgrades.erc1967.getImplementationAddress(await aicoFactory.getAddress()),
            constructorArguments: [],
        });
        console.log("AICOFactory implementation verified");
    } catch (error) {
        console.error("Error verifying AICOFactory:", error);
    }

    // Print deployment summary
    console.log("\nDeployment Summary:");
    console.log("-------------------");
    console.log("VetoContract:", await vetoContract.getAddress());
    console.log("DelayModule:", await delayModule.getAddress());
    console.log("ProtocolRewards:", await protocolRewards.getAddress());
    console.log("BondingCurve:", await bondingCurve.getAddress());
    console.log("PoolCreationSubsidy:", await poolCreationSubsidy.getAddress());
    console.log("AICO Implementation:", await aicoImpl.getAddress());
    console.log("AICOGovernor Implementation:", await aicoGovernorImpl.getAddress());
    console.log("AICOFactory:", await aicoFactory.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 