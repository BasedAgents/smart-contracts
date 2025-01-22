require("dotenv").config();
const { ethers, upgrades, run } = require("hardhat");

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying from address:", deployer.address);
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Initial deployer balance:", ethers.formatEther(balance), "ETH");

    // We'll get real BAG + Uniswap from .env (used in AICO init):
    const BAG_TOKEN_ADDRESS = process.env.BAG_TOKEN_ADDRESS;
    const UNISWAP_V2_FACTORY_ADDRESS = process.env.UNISWAP_V2_FACTORY_ADDRESS;
    const UNISWAP_V2_ROUTER_ADDRESS = ethers.getAddress(process.env.UNISWAP_V2_ROUTER_ADDRESS);
    
    console.log("Using addresses:");
    console.log("BAG Token:", BAG_TOKEN_ADDRESS);
    console.log("Uniswap Factory:", UNISWAP_V2_FACTORY_ADDRESS);
    console.log("Uniswap Router:", UNISWAP_V2_ROUTER_ADDRESS);

    console.log("\nDeploying BondingCurve...");
    // ------------------------------
    // 1) Deploy BondingCurve (logic + proxy)
    // ------------------------------
    const BondingCurveFactory = await ethers.getContractFactory("BondingCurve");

    // BondingCurve logic only
    const bondingCurveLogic = await BondingCurveFactory.deploy(); 
    console.log("BondingCurve logic tx:", bondingCurveLogic.deploymentTransaction()?.hash);
    await bondingCurveLogic.waitForDeployment();
    const bondingCurveLogicAddress = await bondingCurveLogic.getAddress();
    console.log("BondingCurve logic at:", bondingCurveLogicAddress);
    const balanceAfterBCLogic = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance after BondingCurve logic:", ethers.formatEther(balanceAfterBCLogic), "ETH");

    // BondingCurve UUPS proxy
    console.log("\nDeploying BondingCurve proxy...");
    const bondingCurveProxy = await upgrades.deployProxy(
      BondingCurveFactory,
      [BAG_TOKEN_ADDRESS, deployer.address],
      { initializer: "initialize", kind: "uups" }
    );
    await bondingCurveProxy.waitForDeployment();
    const bondingCurveProxyAddress = await bondingCurveProxy.getAddress();
    console.log("BondingCurve (proxy) at:", bondingCurveProxyAddress);
    const balanceAfterBCProxy = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance after BondingCurve proxy:", ethers.formatEther(balanceAfterBCProxy), "ETH");

    // Connect to the proxy as a contract, set parameters
    console.log("\nSetting BondingCurve parameters...");
    const bondingCurve = await ethers.getContractAt("BondingCurve", bondingCurveProxyAddress);
    const paramTx = await bondingCurve.updateCurveParameters(
      ethers.parseUnits("58243640000000", 0),
      ethers.parseUnits("1386294361", 0)
    );
    await paramTx.wait();
    console.log("BondingCurve parameters set");

    // ------------------------------
    // 2) Deploy ProtocolRewards
    // ------------------------------
    console.log("\nDeploying ProtocolRewards...");
    const ProtocolRewardsFactory = await ethers.getContractFactory("ProtocolRewards");
    const protocolRewards = await ProtocolRewardsFactory.deploy();
    console.log("ProtocolRewards tx:", protocolRewards.deploymentTransaction()?.hash);
    await protocolRewards.waitForDeployment();
    const protocolRewardsAddress = await protocolRewards.getAddress();
    console.log("ProtocolRewards at:", protocolRewardsAddress);
    const balanceAfterPR = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance after ProtocolRewards:", ethers.formatEther(balanceAfterPR), "ETH");

    // ------------------------------
    // 3) Deploy PoolCreationSubsidy (logic + proxy)
    // ------------------------------
    console.log("\nDeploying PoolCreationSubsidy...");
    const PoolCreationSubsidy = await ethers.getContractFactory("PoolCreationSubsidy");

    // logic only
    const poolSubsidyLogic = await PoolCreationSubsidy.deploy();
    console.log("PoolCreationSubsidy logic tx:", poolSubsidyLogic.deploymentTransaction()?.hash);
    await poolSubsidyLogic.waitForDeployment();
    const poolSubsidyLogicAddress = await poolSubsidyLogic.getAddress();
    console.log("PoolCreationSubsidy logic at:", poolSubsidyLogicAddress);
    const balanceAfterPSLogic = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance after PoolCreationSubsidy logic:", ethers.formatEther(balanceAfterPSLogic), "ETH");

    // UUPS proxy
    console.log("\nDeploying PoolCreationSubsidy proxy...");
    const poolSubsidyProxy = await upgrades.deployProxy(
      PoolCreationSubsidy,
      [UNISWAP_V2_FACTORY_ADDRESS, deployer.address],
      { initializer: "initialize", kind: "uups" }
    );
    await poolSubsidyProxy.waitForDeployment();
    const poolSubsidyProxyAddress = await poolSubsidyProxy.getAddress();
    console.log("PoolCreationSubsidy (proxy) at:", poolSubsidyProxyAddress);
    const balanceAfterPSProxy = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance after PoolCreationSubsidy proxy:", ethers.formatEther(balanceAfterPSProxy), "ETH");

    // ------------------------------
    // 4) Deploy AICO + Governor logic
    // ------------------------------
    console.log("\nDeploying AICO logic...");
    const AICO = await ethers.getContractFactory("AICO");
    const aicoImpl = await AICO.deploy();
    console.log("AICO logic tx:", aicoImpl.deploymentTransaction()?.hash);
    await aicoImpl.waitForDeployment();
    const aicoImplAddress = await aicoImpl.getAddress();
    console.log("AICO logic at:", aicoImplAddress);
    const balanceAfterAICOLogic = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance after AICO logic:", ethers.formatEther(balanceAfterAICOLogic), "ETH");

    console.log("\nDeploying Governor logic...");
    const Gov = await ethers.getContractFactory("AICOGovernorImpl");
    const govImpl = await Gov.deploy();
    console.log("Governor logic tx:", govImpl.deploymentTransaction()?.hash);
    await govImpl.waitForDeployment();
    const govImplAddress = await govImpl.getAddress();
    console.log("Governor logic at:", govImplAddress);
    const balanceAfterGovLogic = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance after Governor logic:", ethers.formatEther(balanceAfterGovLogic), "ETH");

    // ------------------------------
    // 5) Deploy AICOFactory (logic + proxy)
    // ------------------------------
    console.log("\nDeploying AICOFactory logic...");
    const AICOFactory = await ethers.getContractFactory("AICOFactoryImpl");

    // logic only
    const aicoFactoryLogic = await AICOFactory.deploy();
    console.log("AICOFactory logic tx:", aicoFactoryLogic.deploymentTransaction()?.hash);
    await aicoFactoryLogic.waitForDeployment();
    const aicoFactoryLogicAddress = await aicoFactoryLogic.getAddress();
    console.log("AICOFactory logic at:", aicoFactoryLogicAddress);
    const balanceAfterAFLogic = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance after AICOFactory logic:", ethers.formatEther(balanceAfterAFLogic), "ETH");

    // UUPS proxy
    console.log("\nDeploying AICOFactory proxy...");
    const aicoFactoryProxy = await upgrades.deployProxy(
      AICOFactory,
      [aicoImplAddress, govImplAddress, deployer.address],
      { initializer: "initialize", kind: "uups" }
    );
    await aicoFactoryProxy.waitForDeployment();
    const aicoFactoryProxyAddress = await aicoFactoryProxy.getAddress();
    console.log("AICOFactory (proxy) at:", aicoFactoryProxyAddress);
    const balanceAfterAFProxy = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance after AICOFactory proxy:", ethers.formatEther(balanceAfterAFProxy), "ETH");

    // ------------------------------
    // 6) Create the AICO + Governor
    // ------------------------------
    console.log("\nCreating AICO and Governor instances...");
    const aicoFactoryInstance = await ethers.getContractAt("AICOFactoryImpl", aicoFactoryProxyAddress);

    // build the init data for AICO
    const aicoInitData = AICO.interface.encodeFunctionData("initialize", [
      deployer.address,              // tokenCreator
      deployer.address,              // platformReferrer
      bondingCurveProxyAddress,      // bondingCurve
      ethers.ZeroAddress,            // agentWallet => replaced by Gov
      BAG_TOKEN_ADDRESS,             // real BAG on Sepolia
      "myAgentTokenURI",
      "AgentToken",
      "AGT",
      poolSubsidyProxyAddress,       // <--- pass the real poolSubsidy here!
      UNISWAP_V2_FACTORY_ADDRESS,
      deployer.address,              // protocolFeeRecipient
      protocolRewardsAddress,
      deployer.address,              // AICO admin
      ethers.ZeroAddress             // governance => replaced by Gov
    ]);

    console.log("\nCalling createAICOWithGovernor...");
    const createTx = await aicoFactoryInstance.createAICOWithGovernor(
      aicoInitData,
      deployer.address, 
      1,  // votingDelay
      50, // votingPeriod
      0   // proposalThreshold
    );
    console.log("createAICOWithGovernor tx:", createTx.hash);
    const rcpt = await createTx.wait();
    console.log("createAICOWithGovernor receipt received");

    const createdEvent = rcpt.logs.find((log) => log.fragment?.name === "AICOCreated");
    const aicoAddress = createdEvent.args.aico;
    const governorAddress = createdEvent.args.governor;
    console.log("AICO deployed at:", aicoAddress);
    console.log("Governor deployed at:", governorAddress);
    const balanceAfterCreate = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance after AICO+Governor creation:", ethers.formatEther(balanceAfterCreate), "ETH");

    // Transfer BondingCurve ownership => AICO
    console.log("\nTransferring BondingCurve ownership...");
    const ownershipTx = await bondingCurve.transferOwnership(aicoAddress);
    await ownershipTx.wait();
    console.log("BondingCurve ownership transferred to AICO:", aicoAddress);

    // Set real Uniswap router in AICO
    console.log("\nSetting Uniswap router...");
    const aicoContract = await ethers.getContractAt("AICO", aicoAddress);
    const routerTx = await aicoContract.setUniswapV2Router(UNISWAP_V2_ROUTER_ADDRESS);
    await routerTx.wait();
    console.log("Set Uniswap router:", UNISWAP_V2_ROUTER_ADDRESS);
    const finalBalance = await ethers.provider.getBalance(deployer.address);
    console.log("Final deployer balance:", ethers.formatEther(finalBalance), "ETH");

    console.log("\nAll deployments done!");
    console.log("==== Addresses ====");
    console.log("BondingCurve Logic:", bondingCurveLogicAddress);
    console.log("BondingCurve Proxy:", bondingCurveProxyAddress);
    console.log("PoolCreationSubsidy Logic:", poolSubsidyLogicAddress);
    console.log("PoolCreationSubsidy Proxy:", poolSubsidyProxyAddress);
    console.log("ProtocolRewards:", protocolRewardsAddress);
    console.log("AICO Logic:", aicoImplAddress);
    console.log("Governor Logic:", govImplAddress);
    console.log("AICOFactory Logic:", aicoFactoryLogicAddress);
    console.log("AICOFactory Proxy:", aicoFactoryProxyAddress);
    console.log("AICO (runtime):", aicoAddress);
    console.log("Governor:", governorAddress);

  } catch (error) {
    console.error("\nDeployment failed with error:", error);
    // Log additional error details if available
    if (error.error) {
      console.error("Internal error:", error.error);
    }
    if (error.transaction) {
      console.error("Failed transaction:", error.transaction);
    }
    throw error;
  }
}

// Recommended pattern to be able to use async/await everywhere
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
