const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Testing Agent creation with account:", deployer.address);

    // Contract addresses from TestnetV0.1.md
    const BAG_TOKEN = "0x780DB7650ef1F50d949CB56400eE03052C7853CC";
    const FACTORY_PROXY = "0x148eea31e41371eFf65E9816a8d95Fc936DDF2E6";

    // Get contract instances
    const bagToken = await ethers.getContractAt("IERC20", BAG_TOKEN);
    const factory = await ethers.getContractAt("AICOFactoryImpl", FACTORY_PROXY);

    // Check ETH balance
    const ethBalance = await ethers.provider.getBalance(deployer.address);
    console.log("\nETH Balance:", ethers.formatEther(ethBalance), "ETH");

    // Check BAG balance
    const balance = await bagToken.balanceOf(deployer.address);
    console.log("BAG Balance:", ethers.formatEther(balance), "BAG");

    // Check if we have enough BAG tokens (need at least 100 BAG)
    const creationFee = await factory.agentCreationFee();
    console.log("Required creation fee:", ethers.formatEther(creationFee), "BAG");

    if (balance < creationFee) {
        throw new Error("Insufficient BAG balance for creation fee");
    }

    // Check current allowance
    const allowance = await bagToken.allowance(deployer.address, FACTORY_PROXY);
    console.log("Current factory allowance:", ethers.formatEther(allowance), "BAG");

    // Approve factory if needed
    if (allowance < creationFee) {
        console.log("\nApproving factory to spend BAG tokens...");
        const approveTx = await bagToken.approve(FACTORY_PROXY, creationFee);
        await approveTx.wait();
        console.log("Factory approved to spend BAG tokens");
    }

    // Estimate gas for deployment
    console.log("\nEstimating gas costs...");
    const deployParams = [
        deployer.address, // agent creator
        deployer.address, // platform referrer
        deployer.address, // agent wallet
        "ipfs://QmTest", // token URI
        "Test Agent", // name
        "TEST", // symbol
        172800, // voting delay (2 days)
        43200, // voting period (12 hours)
        ethers.parseEther("1000") // proposal threshold
    ];

    const gasEstimate = await factory.deploy.estimateGas(...deployParams);
    const feeData = await ethers.provider.getFeeData();
    const gasCost = gasEstimate * feeData.gasPrice;
    
    console.log("Estimated gas units:", gasEstimate.toString());
    console.log("Gas price:", ethers.formatUnits(feeData.gasPrice, "gwei"), "gwei");
    console.log("Estimated cost:", ethers.formatEther(gasCost), "ETH");

    if (ethBalance < gasCost) {
        throw new Error(`Insufficient ETH for gas. Need ${ethers.formatEther(gasCost)} ETH`);
    }

    // Deploy new Agent token
    console.log("\nCreating new Agent token...");
    const deployTx = await factory.deploy(...deployParams);
    console.log("Transaction hash:", deployTx.hash);
    const receipt = await deployTx.wait();
    
    let tokenAddress, governorAddress;
    
    // Get the token and governor addresses from the events
    for (const log of receipt.logs) {
        try {
            // Try to parse with factory interface first
            const parsed = factory.interface.parseLog(log);
            if (parsed.name === "AICOTokenCreated") {
                tokenAddress = parsed.args[8]; // token address is the 9th argument
                console.log("\nAgent token created!");
                console.log("Token address:", tokenAddress);
            } else if (parsed.name === "GovernorCreated") {
                governorAddress = parsed.args.governor;
                console.log("Governor address:", governorAddress);
            }
        } catch (e) {
            // Skip logs that can't be parsed
            continue;
        }
    }

    console.log("\nDeployment Summary:");
    console.log("-------------------");
    console.log("Transaction:", `https://sepolia.etherscan.io/tx/${deployTx.hash}`);
    console.log("Token:", tokenAddress);
    console.log("Governor:", governorAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 