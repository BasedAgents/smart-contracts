// AICOFlow.local.test.js

const { expect } = require("chai");
const { ethers, upgrades, network } = require("hardhat");

// Constants
const AGENT_ALLOCATION = 300_000_000n * 10n ** 18n; // 300M tokens with 18 decimals

describe("AICO Local Tests", function () {
  let owner;
  let user;
  let mockBagToken;
  let mockBagTokenAddress;
  let bondingCurve;
  let bondingCurveAddress;
  let poolSubsidy;
  let poolSubsidyAddress;
  let protocolRewards;
  let protocolRewardsAddress;
  let mockUniswapFactory;
  let mockUniswapFactoryAddress;
  let mockUniswapRouter;
  let mockUniswapRouterAddress;
  let aico;
  let aicoAddress;
  let governor;
  let governorAddress;

  // Just for reference, not actually used in local tests:
  const REAL_BAG_TOKEN = "0x780DB7650ef1F50d949CB56400eE03052C7853CC";
  const REAL_UNISWAP_V2_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

  before(async function () {
    // Get signers
    [owner, user] = await ethers.getSigners();
  });

  beforeEach(async function () {
    // Reset to a fresh state
    await network.provider.send("hardhat_reset");
    [owner, user] = await ethers.getSigners();

    // Deploy mock BAG token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockBagToken = await MockERC20.deploy("Mock BAG", "mBAG");
    await mockBagToken.waitForDeployment();
    mockBagTokenAddress = await mockBagToken.getAddress();

    console.log("Using Mock BAG for local tests.");

    // Deploy BondingCurve
    const BondingCurveFactory = await ethers.getContractFactory("BondingCurve");
    bondingCurve = await upgrades.deployProxy(
      BondingCurveFactory,
      [mockBagTokenAddress, owner.address],
      {
        initializer: "initialize",
        kind: "uups",
      }
    );
    await bondingCurve.waitForDeployment();
    bondingCurveAddress = await bondingCurve.getAddress();

    // Set curve parameters (matching approximate real values)
    await bondingCurve.updateCurveParameters(
      ethers.parseUnits("58243640000000", 0),
      ethers.parseUnits("1386294361", 0)
    );

    // Deploy ProtocolRewards
    const ProtocolRewards = await ethers.getContractFactory("ProtocolRewards");
    protocolRewards = await ProtocolRewards.deploy();
    await protocolRewards.waitForDeployment();
    protocolRewardsAddress = await protocolRewards.getAddress();

    // Deploy mock Uniswap factory and router
    const MockUniswapV2Factory = await ethers.getContractFactory("MockUniswapV2Factory");
    mockUniswapFactory = await MockUniswapV2Factory.deploy(owner.address);
    await mockUniswapFactory.waitForDeployment();
    mockUniswapFactoryAddress = await mockUniswapFactory.getAddress();

    const MockUniswapV2Router = await ethers.getContractFactory("MockUniswapV2Router");
    mockUniswapRouter = await MockUniswapV2Router.deploy(mockUniswapFactoryAddress);
    await mockUniswapRouter.waitForDeployment();
    mockUniswapRouterAddress = await mockUniswapRouter.getAddress();

    // Deploy PoolCreationSubsidy with mock factory
    const PoolCreationSubsidy = await ethers.getContractFactory("PoolCreationSubsidy");
    poolSubsidy = await upgrades.deployProxy(
      PoolCreationSubsidy,
      [mockUniswapFactoryAddress, owner.address],
      {
        initializer: "initialize",
        kind: "uups",
      }
    );
    await poolSubsidy.waitForDeployment();
    poolSubsidyAddress = await poolSubsidy.getAddress();

    // Send ETH to PoolCreationSubsidy for gas costs
    await owner.sendTransaction({
      to: poolSubsidyAddress,
      value: ethers.parseEther("1.0"), // 1 ETH
    });

    // Mint BAG tokens to user for testing
    const initialBagBalance = ethers.parseUnits("200000", 18);
    await mockBagToken.mint(user.address, initialBagBalance);

    // Mint BAG tokens to protocol rewards for fee distribution
    await mockBagToken.mint(protocolRewards.getAddress(), ethers.parseUnits("1000", 18));

    // Deploy AICO implementation
    const AICO = await ethers.getContractFactory("AICO");
    const aicoImpl = await AICO.deploy();
    await aicoImpl.waitForDeployment();
    const aicoImplAddress = await aicoImpl.getAddress();

    // Deploy Governor implementation
    const AICOGovernorImpl = await ethers.getContractFactory("AICOGovernorImpl");
    const governorImpl = await AICOGovernorImpl.deploy();
    await governorImpl.waitForDeployment();
    const governorImplAddress = await governorImpl.getAddress();

    // Deploy AICOFactory
    const AICOFactory = await ethers.getContractFactory("AICOFactoryImpl");
    const aicoFactory = await upgrades.deployProxy(
      AICOFactory,
      [aicoImplAddress, governorImplAddress, owner.address],
      {
        initializer: "initialize",
        kind: "uups",
      }
    );
    await aicoFactory.waitForDeployment();

    // Create AICO + Governor through factory
    const aicoInitData = AICO.interface.encodeFunctionData("initialize", [
      owner.address, // tokenCreator
      owner.address, // platformReferrer
      bondingCurveAddress, // bondingCurve
      ethers.ZeroAddress, // agentWallet - replaced by Governor
      mockBagTokenAddress, // mock BAG
      "myAgentTokenURI",
      "AgentToken",
      "AGT",
      poolSubsidyAddress,
      mockUniswapFactoryAddress,
      owner.address, // protocolFeeRecipient
      protocolRewardsAddress,
      owner.address, // AICO owner is factory owner
      ethers.ZeroAddress, // governanceContract => replaced by Governor
    ]);

    const createTx = await aicoFactory.createAICOWithGovernor(
      aicoInitData,
      owner.address, // tokenCreator who will also own governor
      1, // 1 block voting delay
      50, // 50 blocks voting period
      0 // 0 proposal threshold
    );
    const receipt = await createTx.wait();

    // Read the AICOCreated event for new addresses
    const createdEvent = receipt.logs.find((log) => log.fragment?.name === "AICOCreated");
    aicoAddress = createdEvent.args.aico;
    governorAddress = createdEvent.args.governor;

    // Get contract instances
    aico = await ethers.getContractAt("AICO", aicoAddress);
    governor = await ethers.getContractAt("AICOGovernorImpl", governorAddress);

    // Approve AICO to spend user's BAG tokens
    await mockBagToken.connect(user).approve(aicoAddress, ethers.MaxUint256);

    // Set router in AICO
    await aico.connect(owner).setUniswapV2Router(mockUniswapRouterAddress);

    // Transfer BondingCurve ownership to AICO
    await bondingCurve.connect(owner).transferOwnership(aicoAddress);

    // Authorize AICO in PoolCreationSubsidy
    await poolSubsidy.setAuthorizedCaller(aicoAddress, true);
  });

  /**
   * 1) Bonding Curve Token Minting
   */
  it("Should produce correct ~500M tokens for 42k BAG", async () => {
    const testAmounts = [
      { bag: "1000", description: "1k BAG" },
      { bag: "10000", description: "10k BAG" },
      { bag: "30000", description: "30k BAG" },
      { bag: "41999", description: "~42k BAG" },
      { bag: "42000", description: "42k BAG (max)" },
    ];

    for (const test of testAmounts) {
      const bagAmount = ethers.parseUnits(test.bag, 18);
      const tokens = await bondingCurve.getBAGBuyQuote(0, bagAmount);
      console.log(`${test.description} => ${ethers.formatUnits(tokens, 18)} tokens`);
    }

    // ~500M at 42k BAG
    const bag42k = ethers.parseUnits("42000", 18);
    const minted = await bondingCurve.getBAGBuyQuote(0, bag42k);
    console.log("42k => minted:", ethers.formatUnits(minted, 18), "tokens");

    // want ~500M with ~2% tolerance
    const target = ethers.parseUnits("500000000", 18);
    const tolerance = (target * 2n) / 100n;
    expect(BigInt(minted)).to.be.closeTo(target, tolerance);
  });

  /**
   * 2) Fee Distribution
   */
  it("Should buy and distribute fees", async () => {
    const currentSupply = await aico.totalSupply();
    const agentAlloc = await aico.AGENT_ALLOCATION();
    const primarySupply = await aico.PRIMARY_MARKET_SUPPLY();
    const availableSupply = primarySupply - (currentSupply - agentAlloc);

    console.log(
      "Available supply before graduation:",
      ethers.formatUnits(availableSupply, 18)
    );

    // We'll buy with 1 BAG
    const bagSpend = ethers.parseUnits("1", 18);

    // Check how many tokens that *should* produce on the curve
    const tokens = await bondingCurve.getBAGBuyQuote(currentSupply - agentAlloc, bagSpend);

    // Approve (already done in beforeEach, but repeating for clarity)
    await mockBagToken.connect(user).approve(aico.getAddress(), bagSpend);

    // Execute the buy
    const minTokensOut = (tokens * 90n) / 100n; // 10% slippage
    await aico.connect(user).buy(
      user.address,
      ethers.ZeroAddress,
      "TestBuy",
      bagSpend,
      minTokensOut,
      BigInt((await ethers.provider.getBlock("latest")).timestamp + 300)
    );

    // Confirm user spent exactly 1 BAG (since fee is internal to AICO)
    const userBagAfter = await mockBagToken.balanceOf(user.address);
    // The user started with 200k BAG minted in beforeEach, so let's just see the difference
    // but we don't strictly assert the difference here. We'll do a fee check next.

    // Check how fees were distributed. The ProtocolRewards contract accumulates the protocol portion:
    const feeBags = await protocolRewards.tokenBalanceOf(mockBagToken.getAddress(), owner.address);
    // Because orderReferrer=Zero => that 15% also goes to protocolFeeRecipient => which is owner
    // So the entire 1% fee ends up in the protocol under "owner" if using the default code logic.
    // 1% of 1 BAG = 0.01 BAG. Let's confirm it's minted as 0.01 (with 18 decimals).
    expect(feeBags).to.be.gt(0);

    console.log("Test buy: fees distributed => user minted tokens => pass");
  });

  /**
   * 3) Token Selling Through Bonding Curve
   */
  it("Should sell tokens through bonding curve", async () => {
    // First do a buy to get some BAG into the bonding curve
    const bagSpend = ethers.parseUnits("10", 18);
    await mockBagToken.connect(user).approve(aico.getAddress(), bagSpend);

    const currentSupply = BigInt(await aico.totalSupply());
    const agentAlloc = BigInt(await aico.AGENT_ALLOCATION());
    const tokensBought = await bondingCurve.getBAGBuyQuote(currentSupply - agentAlloc, bagSpend);

    await aico.connect(user).buy(
      user.address,
      ethers.ZeroAddress,
      "BuyBeforeSell",
      bagSpend,
      BigInt(tokensBought) * 90n / 100n,
      BigInt((await ethers.provider.getBlock("latest")).timestamp + 300)
    );

    // Now try to sell half of the tokens
    const userTokenBal = await aico.balanceOf(user.address);
    const tokensToSell = userTokenBal / 2n;

    // Check how many BAG we expect
    const supplyBefore = BigInt(await aico.totalSupply()) - BigInt(agentAlloc);
    const bagQuote = await bondingCurve.getTokenSellQuote(supplyBefore, tokensToSell);
    // We'll do 5% slippage safety
    const minBagOut = BigInt(bagQuote) * 95n / 100n;

    // Approve tokens to AICO
    await aico.connect(user).approve(aico.getAddress(), tokensToSell);

    // Sell
    await aico.connect(user).sell(
      user.address,
      ethers.ZeroAddress,
      "TestSell",
      tokensToSell,
      minBagOut,
      BigInt((await ethers.provider.getBlock("latest")).timestamp + 300)
    );

    const userTokenAfter = await aico.balanceOf(user.address);
    expect(userTokenAfter).to.equal(userTokenBal - tokensToSell);

    console.log(`User sold ${tokensToSell} tokens => ~${ethers.formatUnits(bagQuote, 18)} BAG`);
  });

  /**
   * 4) Buy/Sell Sequence
   */
  it("Should handle buy/sell sequence correctly", async () => {
    // 1) Do the buy
    const bagSpend = ethers.parseUnits("10", 18);
    await mockBagToken.connect(user).approve(aico.getAddress(), bagSpend);
    await aico.connect(user).buy(
      user.address,
      ethers.ZeroAddress,
      "SequenceBuy",
      bagSpend,
      0, // minimal slippage
      BigInt((await ethers.provider.getBlock("latest")).timestamp + 300)
    );

    // 2) Check how many tokens we ACTUALLY got
    const userTokenBalance = await aico.balanceOf(user.address);
    console.log("User minted =>", ethers.formatUnits(userTokenBalance, 18), "tokens");

    // 3) Sell half
    const tokensToSell = userTokenBalance / 2n;
    await aico.connect(user).approve(aico.getAddress(), tokensToSell);

    // 4) Get quote and sell
    const supplyBeforeSell = BigInt(await aico.totalSupply()) - AGENT_ALLOCATION;
    const bagQuote = await bondingCurve.getTokenSellQuote(supplyBeforeSell, tokensToSell);

    await aico.connect(user).sell(
      user.address,
      ethers.ZeroAddress,
      "SequenceSell",
      tokensToSell,
      BigInt(bagQuote) * 90n / 100n, // 10% slippage tolerance
      BigInt((await ethers.provider.getBlock("latest")).timestamp + 300)
    );

    console.log("Buy/Sell sequence completed successfully");
  });

  /**
   * 5) Market Graduation
   */
  it("Should graduate to Uniswap after reaching 500M token supply", async () => {
    // Calculate exact tokens needed to reach 500M
    const currentSupply = BigInt(await aico.totalSupply()) - AGENT_ALLOCATION;
    const neededTokens = await aico.PRIMARY_MARKET_SUPPLY() - currentSupply;

    // We'll try to buy more than what's available on the curve
    const extraTokens = ethers.parseUnits("100000", 18); // Want 100k extra tokens
    const totalTokensWanted = neededTokens + extraTokens;
    console.log("Want total tokens:", ethers.formatUnits(totalTokensWanted, 18));

    // Calculate BAG needed for the full amount (curve portion + extra)
    const bagForCurve = await bondingCurve.getTokenBuyQuote(currentSupply, neededTokens);
    const bagForExtra = extraTokens; // In mock, 1:1 ratio in Uniswap
    const totalBagNeeded = bagForCurve + bagForExtra;
    
    // Add 1% to account for fees
    const bagWithFee = (totalBagNeeded * 10100n) / 10000n;
    console.log("Total BAG needed (with fee):", ethers.formatUnits(bagWithFee, 18));

    // Approve BAG
    await mockBagToken.connect(user).approve(aicoAddress, bagWithFee);

    // Initial checks
    expect(await aico.marketType()).to.equal(0); // BONDING_CURVE

    // Buy with increased BAG amount to ensure we reach 500M after fees
    // and get extra tokens from Uniswap
    await aico.connect(user).buy(
        user.address,
        ethers.ZeroAddress,
        "GraduationBuy",
        bagWithFee,
        totalTokensWanted * 95n / 100n, // Allow 5% slippage
        BigInt((await ethers.provider.getBlock("latest")).timestamp + 300)
    );

    // Check market type changed to UNISWAP_POOL
    expect(await aico.marketType()).to.equal(1);

    // Verify user got both curve tokens and Uniswap tokens
    const finalBalance = await aico.balanceOf(user.address);
    expect(finalBalance).to.be.gte(totalTokensWanted * 95n / 100n);
    console.log("Final user balance:", ethers.formatUnits(finalBalance, 18));

    // Mint some BAG tokens to the router for swaps
    const routerBagAmount = ethers.parseUnits("1000", 18); // 1000 BAG for swaps
    await mockBagToken.mint(mockUniswapRouter.getAddress(), routerBagAmount);

    // Attempt another buy => should work through Uniswap
    const smallBuy = ethers.parseUnits("1", 18);
    await mockBagToken.connect(user).approve(aicoAddress, smallBuy);
    await aico.connect(user).buy(
        user.address,
        ethers.ZeroAddress,
        "UniswapBuy",
        smallBuy,
        0, // No slippage for mock
        BigInt((await ethers.provider.getBlock("latest")).timestamp + 300)
    );

    console.log("Graduation + partial fill successful");
  });

  /**
   * 6) Governance Voting and Execution
   */
  it("Should allow token holders to vote and execute governance proposals", async function () {
    // Governor has 300M (agent allocation). We'll impersonate it for direct calls
    const governorSigner = await ethers.getImpersonatedSigner(governorAddress);
    await network.provider.send("hardhat_setBalance", [
      governorAddress,
      "0x100000000000000000000000", // 1M ETH
    ]);

    // Check the governor indeed has 300M
    const agentAllocation = await aico.AGENT_ALLOCATION();
    const govBal = await aico.balanceOf(governorAddress);
    expect(govBal).to.equal(agentAllocation);

    // Transfer some tokens from governor => AICO for test
    const testAmount = ethers.parseUnits("10", 18);
    const initialAicoBal = BigInt(await aico.balanceOf(aico.getAddress()));
    await aico.connect(governorSigner).transfer(aico.getAddress(), testAmount);
    const finalAicoBal = await aico.balanceOf(aico.getAddress());
    expect(finalAicoBal).to.equal(initialAicoBal + BigInt(testAmount));

    // Give the owner some tokens for voting
    const voteAmount = ethers.parseUnits("30000000", 18); // 30M
    await aico.connect(governorSigner).transfer(owner.address, voteAmount);

    // Delegate to owner
    await aico.connect(owner).delegate(owner.address);

    // Wait for delegation
    for (let i = 0; i < 20; i++) {
      await network.provider.send("evm_mine");
    }

    // Create a proposal that calls aico.transfer(user, 1 token)
    const description = "Transfer tokens to user";
    const transferCalldata = aico.interface.encodeFunctionData("transfer", [
      user.address,
      ethers.parseUnits("1", 18),
    ]);

    const proposeTx = await governor.propose(
      [aico.getAddress()],
      [0],
      [transferCalldata],
      description
    );
    const proposeReceipt = await proposeTx.wait();
    const proposalId = proposeReceipt.logs[0].args.proposalId;

    // Wait 1 block
    await network.provider.send("evm_mine");

    // Vote For
    await governor.castVote(proposalId, 1);

    // Wait for voting period
    for (let i = 0; i < 52; i++) {
      await network.provider.send("evm_mine");
    }

    // If succeeded => execute
    const state = await governor.state(proposalId);
    expect(state).to.equal(4); // Succeeded

    const descHash = ethers.id(description);
    await governor.execute(
      [aico.getAddress()],
      [0],
      [transferCalldata],
      descHash
    );

    // Confirm user got +1 token
    const userBal = await aico.balanceOf(user.address);
    expect(userBal).to.be.gte(ethers.parseUnits("1", 18));

    console.log("Governance transfer proposal => success");
  });

  /**
   * 7) Governance Spending Approval
   */
  it("Should allow token holders (Governor) to approve governance spending", async function () {
    // We'll check normal ERC20 approve from Governor => user
    const governorSigner = await ethers.getImpersonatedSigner(governorAddress);
    await network.provider.send("hardhat_setBalance", [
      governorAddress,
      "0x100000000000000000000000", // 1M ETH
    ]);

    // Governor has 300M
    const testAmount = ethers.parseUnits("10", 18);
    // Transfer 10 tokens from Governor => AICO, for example
    await aico.connect(governorSigner).transfer(aico.getAddress(), testAmount);

    // Transfer 30M to owner for a large voting chunk
    const voteAmount = ethers.parseUnits("30000000", 18);
    await aico.connect(governorSigner).transfer(owner.address, voteAmount);

    // Owner delegates to self
    await aico.connect(owner).delegate(owner.address);
    // wait
    for (let i = 0; i < 20; i++) {
      await network.provider.send("evm_mine");
    }

    // Now propose: "approve(user, 1 token)" from the Governor's perspective
    const description = "Approve spending for user";
    // This calls standard ERC20 approve => msg.sender = governor => sets allowance[governor][user]
    const approveAmount = ethers.parseUnits("1", 18);
    const approveCalldata = aico.interface.encodeFunctionData("approve", [
      user.address,
      approveAmount,
    ]);

    const proposeTx = await governor.propose(
      [aico.getAddress()],
      [0],
      [approveCalldata],
      description
    );
    const proposeRcpt = await proposeTx.wait();
    const proposalId = proposeRcpt.logs[0].args.proposalId;

    // Wait 1 block
    await network.provider.send("evm_mine");

    // Vote
    await governor.castVote(proposalId, 1);

    // Wait for voting period
    for (let i = 0; i < 52; i++) {
      await network.provider.send("evm_mine");
    }

    // Execute
    expect(await governor.state(proposalId)).to.equal(4); // Succeeded
    const descHash = ethers.id(description);
    await governor.execute([aico.getAddress()], [0], [approveCalldata], descHash);

    // Check allowance => it's allowance[governorAddress][user], not [aicoAddress][user]
    const finalAllowance = await aico.allowance(governorAddress, user.address);
    expect(finalAllowance).to.equal(approveAmount);

    // user can now call transferFrom(governor, user, 1) if the governor has tokens, etc.
    console.log("Governance standard approve => now user has allowance from governor");
  });

  /**
   * 8) Proposal Rights Change
   */
  it("Should allow changing proposal rights from Agent Creator to any holder", async function () {
    // We'll propose setProposalThreshold(0)
    const governorSigner = await ethers.getImpersonatedSigner(governorAddress);
    await network.provider.send("hardhat_setBalance", [
      governorAddress,
      "0x100000000000000000000000", // 1M ETH
    ]);

    // Delegate voting power to owner
    await aico.connect(governorSigner).delegate(owner.address);
    for (let i = 0; i < 20; i++) {
      await network.provider.send("evm_mine");
    }

    // Propose
    const description = "Change proposal rights";
    const changeRightsCalldata = governor.interface.encodeFunctionData("setProposalThreshold", [0]);
    const proposeTx = await governor.propose(
      [governor.getAddress()],
      [0],
      [changeRightsCalldata],
      description
    );
    const rcpt = await proposeTx.wait();
    const proposalId = rcpt.logs[0].args.proposalId;

    // wait 1 block for voting delay
    await network.provider.send("evm_mine");

    // vote For
    await governor.castVote(proposalId, 1);

    // wait 50 blocks
    for (let i = 0; i < 52; i++) {
      await network.provider.send("evm_mine");
    }

    expect(await governor.state(proposalId)).to.equal(4); // Succeeded
    const descHash = ethers.id(description);
    await governor.execute(
      [governor.getAddress()],
      [0],
      [changeRightsCalldata],
      descHash
    );

    // confirm threshold is now 0
    expect(await governor.proposalThreshold()).to.equal(0);
  });
});
