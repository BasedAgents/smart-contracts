// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // 1. Deploy AgentERC20VotesImplementation
  const AgentTokenCF = await hre.ethers.getContractFactory("AgentERC20VotesImplementation");
  const agentImpl = await AgentTokenCF.deploy();
  await agentImpl.deployed();
  console.log("agentImpl:", agentImpl.address);

  // 2. Deploy PlatformHook
  // For real usage, pass your governanceMultisig, protocolAddr, platformAddr:
  const governanceMultisig = deployer.address;
  const protocolAddr = deployer.address;
  const platformAddr = deployer.address;

  const HookCF = await hre.ethers.getContractFactory("PlatformHook");
  const hook = await HookCF.deploy(
    governanceMultisig,
    protocolAddr,
    platformAddr
  );
  await hook.deployed();
  console.log("PlatformHook:", hook.address);

  // 3. Base Sepolia PoolManager or a local dummy:
  //   real = "0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408";
  // For local dev, let's just do a placeholder:
  const poolManagerAddr = "0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408";

  // 4. Suppose we have a known BAG token or we do a mock. For main usage, pass your real address:
  const bagTokenAddr = "0xBAG9999999999999999999999999999999999999";

  // 5. Deploy AgentFactory
  const FactoryCF = await hre.ethers.getContractFactory("AgentFactory");
  const factory = await FactoryCF.deploy(
    agentImpl.address,
    governanceMultisig,
    hook.address,
    poolManagerAddr,
    bagTokenAddr
  );
  await factory.deployed();
  console.log("AgentFactory:", factory.address);

  // Done
  console.log("Deployment complete.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
