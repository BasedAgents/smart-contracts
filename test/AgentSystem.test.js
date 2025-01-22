const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Agent System with setAgentWallet approach", function () {
  let deployer, user, newWallet;
  let agentImpl, hook, factory, bagMock;
  let AgentTokenCF, PlatformHookCF, AgentFactoryCF, MockERC20CF;

  before(async () => {
    [deployer, user, newWallet] = await ethers.getSigners();

    // Deploy mock BAG
    MockERC20CF = await ethers.getContractFactory("MockERC20");
    bagMock = await MockERC20CF.deploy("Mock BAG", "MBAG");
    await bagMock.deployed();

    // Deploy AgentERC20VotesImplementation
    AgentTokenCF = await ethers.getContractFactory("AgentERC20VotesImplementation");
    agentImpl = await AgentTokenCF.deploy();
    await agentImpl.deployed();

    // Deploy PlatformHook
    PlatformHookCF = await ethers.getContractFactory("PlatformHook");
    hook = await PlatformHookCF.deploy(
      deployer.address,  // governance
      deployer.address,  // protocol
      deployer.address   // platform
    );
    await hook.deployed();

    // Deploy AgentFactory
    AgentFactoryCF = await ethers.getContractFactory("AgentFactory");
    factory = await AgentFactoryCF.deploy(
      agentImpl.address,
      deployer.address, // governance
      hook.address,
      "0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408", // base sepolia manager stub
      bagMock.address
    );
    await factory.deployed();
  });

  it("Creates an Agent token with user-supplied EOA wallet", async function () {
    // We'll pass a dummy pool key
    const currency0 = "0x1111111111111111111111111111111111111111";
    const currency1 = "0x2222222222222222222222222222222222222222";
    const fee = 3000;
    const tSpacing = 60;
    const hooksAddr = hook.address;

    const sampleKey = {
      currency0,
      currency1,
      fee,
      tickSpacing: tSpacing,
      hooks: hooksAddr
    };

    const initialPrice = "79228162514264337593543950336"; // 1:1

    // createAgent with agentWallet = user (an EOA)
    const tx = await factory.createAgent(
      "MyAgent",
      "MAG",
      user.address,
      ethers.constants.AddressZero,
      ethers.utils.parseEther("100"),  // agentMint
      ethers.utils.parseEther("50"),   // poolMint
      ethers.utils.parseEther("1000"), // bagDeposit
      "URI",
      sampleKey,
      initialPrice
    );
    const receipt = await tx.wait();
    const event = receipt.events.find(e => e.event === "AgentCreated");
    expect(event).to.not.be.undefined;
    const agentTokenAddr = event.args.agentToken;
    console.log("Agent Token deployed at:", agentTokenAddr);

    // check minted amounts
    const agentToken = await ethers.getContractAt("AgentERC20VotesImplementation", agentTokenAddr);
    expect(await agentToken.balanceOf(user.address)).to.equal(ethers.utils.parseEther("100"));
    expect(await agentToken.balanceOf(factory.address)).to.equal(ethers.utils.parseEther("50"));

    // agentWallet is user
    expect(await agentToken.agentWallet()).to.equal(user.address);
  });

  it("Upgrades the Agent's wallet to a new address (e.g. Gnosis Safe)", async function () {
    // Suppose we have the agent token from above
    // We'll fetch the last AgentCreated from the logs
    const filter = factory.filters.AgentCreated();
    const logs = await factory.queryFilter(filter);
    const lastLog = logs[logs.length - 1];
    const agentTokenAddr = lastLog.args.agentToken;

    const agentToken = await ethers.getContractAt("AgentERC20VotesImplementation", agentTokenAddr);

    // Initially, agentWallet = user
    expect(await agentToken.agentWallet()).to.equal(user.address);

    // We'll pretend newWallet is a Gnosis Safe address
    // For the test, we just use "newWallet.address"
    // Must call setAgentWallet(...) as the old agentWallet
    await expect(
      agentToken.connect(newWallet).setAgentWallet(newWallet.address)
    ).to.be.revertedWith("Not agentWallet");

    // So the user must call
    const tx2 = await agentToken.connect(user).setAgentWallet(newWallet.address);
    await tx2.wait();

    expect(await agentToken.agentWallet()).to.equal(newWallet.address);
  });
});
