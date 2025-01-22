const { ethers, run, upgrades } = require("hardhat");

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verifyContract(name, address, constructorArgs = []) {
  try {
    console.log(`\nVerifying ${name}...`);
    await run("verify:verify", {
      address: address,
      constructorArguments: constructorArgs
    });
    console.log(`${name} verified successfully`);
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log(`${name} is already verified`);
    } else {
      console.log(`Error verifying ${name}:`, error.message);
    }
  }
  // Wait between verifications to avoid rate limiting
  await delay(30000);
}

async function main() {
  // 1. Ensure you have Etherscan/Infura config if verifying
  const hasEtherscan = !!process.env.ETHERSCAN_API_KEY;
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Use existing BAG token on Sepolia
  const BAG_TOKEN_ADDRESS = "0x780DB7650ef1F50d949CB56400eE03052C7853CC";
  console.log("Using existing BAG Token at:", BAG_TOKEN_ADDRESS);

  // Use correct addresses for your environment
  const UNISWAP_V2_FACTORY_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

  // Hard-coded typical values for the curve
  // A = 1.06 (with 18 decimals) => 1.06 * 10^18
  // B = 0.000000084 (with 18 decimals) => tuned for 42M BAG => 500M tokens
  const A_VAL = ethers.parseUnits("1.06", 18);
  const B_VAL = ethers.parseUnits("0.000000084", 18);

  // ----------------------------------------------------------------
  // Deploy BondingCurve
  // ----------------------------------------------------------------
  const BondingCurve = await ethers.getContractFactory("BondingCurve");
  console.log("Deploying BondingCurve...");
  const bondingCurve = await upgrades.deployProxy(BondingCurve, [BAG_TOKEN_ADDRESS, deployer.address], {
    initializer: 'initialize',
    kind: 'uups'
  });
  await bondingCurve.waitForDeployment();
  const bondingCurveAddress = await bondingCurve.getAddress();
  console.log("BondingCurve deployed at:", bondingCurveAddress);

  // *Set the initial parameters*
  let tx = await bondingCurve.updateCurveParameters(A_VAL, B_VAL);
  await tx.wait();
  console.log("BondingCurve parameters set: A =", A_VAL.toString(), ", B =", B_VAL.toString());

  // ----------------------------------------------------------------
  // Deploy PoolCreationSubsidy
  // ----------------------------------------------------------------
  const PoolCreationSubsidy = await ethers.getContractFactory("PoolCreationSubsidy");
  console.log("Deploying PoolCreationSubsidy...");
  const poolSubsidy = await upgrades.deployProxy(PoolCreationSubsidy, [UNISWAP_V2_FACTORY_ADDRESS, deployer.address], {
    initializer: 'initialize',
    kind: 'uups'
  });
  await poolSubsidy.waitForDeployment();
  const poolSubsidyAddress = await poolSubsidy.getAddress();
  console.log("PoolCreationSubsidy deployed at:", poolSubsidyAddress);

  // ----------------------------------------------------------------
  // Deploy ProtocolRewards
  // ----------------------------------------------------------------
  const ProtocolRewards = await ethers.getContractFactory("ProtocolRewards");
  const protocolRewards = await ProtocolRewards.deploy();
  await protocolRewards.waitForDeployment();
  const protocolRewardsAddress = await protocolRewards.getAddress();
  console.log("ProtocolRewards deployed at:", protocolRewardsAddress);

  // ----------------------------------------------------------------
  // Deploy AICO Implementation
  // ----------------------------------------------------------------
  const AICO = await ethers.getContractFactory("AICO");
  console.log("Deploying AICO implementation...");
  const aicoImpl = await AICO.deploy();
  await aicoImpl.waitForDeployment();
  const aicoImplAddress = await aicoImpl.getAddress();
  console.log("AICO Implementation deployed at:", aicoImplAddress);

  // ----------------------------------------------------------------
  // Deploy AICOFactory (Proxy) for AICO
  // ----------------------------------------------------------------
  const AICOFactory = await ethers.getContractFactory("AICOFactory");
  console.log("Deploying AICOFactory...");
  const aicoProxy = await AICOFactory.deploy(aicoImplAddress, "0x");
  await aicoProxy.waitForDeployment();
  const aicoProxyAddress = await aicoProxy.getAddress();
  console.log("AICO Proxy deployed at:", aicoProxyAddress);

  // Attach AICO interface
  const aico = await ethers.getContractAt("AICO", aicoProxyAddress);

  // ----------------------------------------------------------------
  // Deploy AICOGovernorImpl
  // ----------------------------------------------------------------
  const AICOGovernorImpl = await ethers.getContractFactory("AICOGovernorImpl");
  console.log("Deploying AICOGovernorImpl...");
  const governor = await upgrades.deployProxy(AICOGovernorImpl, [
    aicoProxyAddress,
    deployer.address,
    1, // votingDelay
    100, // votingPeriod
    0 // proposalThreshold
  ], {
    initializer: 'initialize',
    kind: 'uups'
  });
  await governor.waitForDeployment();
  const governorAddress = await governor.getAddress();
  console.log("AICOGovernorImpl deployed at:", governorAddress);

  // ----------------------------------------------------------------
  // Deploy AICOFactoryImpl (upgradeable)
  // ----------------------------------------------------------------
  const AICOFactoryImpl = await ethers.getContractFactory("AICOFactoryImpl");
  console.log("Deploying AICOFactoryImpl...");
  const aicoFactoryImplProxy = await upgrades.deployProxy(
    AICOFactoryImpl,
    [aicoImplAddress, deployer.address],
    { kind: "uups" }
  );
  await aicoFactoryImplProxy.waitForDeployment();
  const aicoFactoryImplAddress = await aicoFactoryImplProxy.getAddress();
  console.log("AICOFactoryImpl (upgradeable) deployed at:", aicoFactoryImplAddress);

  // ----------------------------------------------------------------
  // Initialize the AICO Proxy
  // ----------------------------------------------------------------
  console.log("Initializing AICO Proxy...");
  tx = await aico.initialize(
    deployer.address,          // tokenCreator
    deployer.address,          // platformReferrer
    bondingCurveAddress,       // bondingCurve
    deployer.address,          // agentWallet
    BAG_TOKEN_ADDRESS,         // BAG
    "myAgentTokenURI",
    "AgentToken",
    "AGT",
    poolSubsidyAddress,
    UNISWAP_V2_FACTORY_ADDRESS,
    deployer.address,          // protocolFeeRecipient
    protocolRewardsAddress
  );
  await tx.wait();
  console.log("AICO Proxy initialized");

  // Authorize the AICO proxy in PoolCreationSubsidy
  await poolSubsidy.setAuthorizedCaller(aicoProxyAddress, true);
  console.log("AICO Proxy authorized in PoolCreationSubsidy");

  // ----------------------------------------------------------------
  // Contract Verification
  // ----------------------------------------------------------------
  if (!hasEtherscan) {
    console.log("No ETHERSCAN_API_KEY. Skipping verification...");
    return;
  }

  console.log("\nWaiting before starting verification...");
  await delay(30000);

  // Verify implementation contracts first
  const implementationContracts = [
    {
      name: "ProtocolRewards",
      address: protocolRewardsAddress,
      constructorArgs: []
    },
    {
      name: "AICO Implementation",
      address: aicoImplAddress,
      constructorArgs: []
    },
    {
      name: "BondingCurve Implementation",
      address: await upgrades.erc1967.getImplementationAddress(bondingCurveAddress),
      constructorArgs: []
    },
    {
      name: "PoolCreationSubsidy Implementation",
      address: await upgrades.erc1967.getImplementationAddress(poolSubsidyAddress),
      constructorArgs: []
    },
    {
      name: "AICOGovernorImpl Implementation",
      address: await upgrades.erc1967.getImplementationAddress(governorAddress),
      constructorArgs: []
    },
    {
      name: "AICOFactoryImpl Implementation",
      address: await upgrades.erc1967.getImplementationAddress(aicoFactoryImplAddress),
      constructorArgs: []
    }
  ];

  // Verify proxy contracts
  const proxyContracts = [
    {
      name: "AICO Proxy",
      address: aicoProxyAddress,
      constructorArgs: [aicoImplAddress, "0x"]
    }
  ];

  console.log("\nVerifying implementation contracts...");
  for (const contract of implementationContracts) {
    await verifyContract(contract.name, contract.address, contract.constructorArgs);
  }

  console.log("\nVerifying proxy contracts...");
  for (const contract of proxyContracts) {
    await verifyContract(contract.name, contract.address, contract.constructorArgs);
  }

  console.log("\nDeployment and verification complete!");

  // Log all addresses for easy reference
  console.log("\nDeployed Addresses:");
  console.log("-------------------");
  console.log("BAG Token:", BAG_TOKEN_ADDRESS);
  console.log("BondingCurve Proxy:", bondingCurveAddress);
  console.log("PoolCreationSubsidy Proxy:", poolSubsidyAddress);
  console.log("ProtocolRewards:", protocolRewardsAddress);
  console.log("AICO Implementation:", aicoImplAddress);
  console.log("AICO Proxy:", aicoProxyAddress);
  console.log("AICOGovernorImpl Proxy:", governorAddress);
  console.log("AICOFactoryImpl Proxy:", aicoFactoryImplAddress);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
