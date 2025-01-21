const { expect } = require("chai");
const { ethers } = require("hardhat");
const { upgrades } = require("hardhat");

describe("AICOFlow - Fee Check Test", function() {
  let owner, user, aicoImpl, aicoProxy, aico;
  let bondingCurve, poolSubsidy, protocolRewards, governor;
  let mockBagToken; // renamed to make it clear this is a mock

  // Constants that match Sepolia deployment
  const REAL_BAG_TOKEN = "0x780DB7650ef1F50d949CB56400eE03052C7853CC";
  const REAL_UNISWAP_V2_FACTORY = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

  before(async() => {
    [owner, user] = await ethers.getSigners();

    // 1. Deploy a mock BAG (only for local testing)
    // Note: On Sepolia we use the real BAG token at 0x780DB7650ef1F50d949CB56400eE03052C7853CC
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockBagToken = await MockERC20.deploy("Mock BAG", "mBAG");
    await mockBagToken.deployed();
    console.log("Note: Using MockBAG for local testing. On Sepolia, use the real BAG token.");

    // 2. Deploy AICO Implementation
    const AICO = await ethers.getContractFactory("AICO");
    console.log("Deploying AICO implementation...");
    aicoImpl = await AICO.deploy();
    await aicoImpl.deployed();

    // 3. Deploy AICOFactory (Proxy) for AICO
    const AICOFactory = await ethers.getContractFactory("AICOFactory");
    console.log("Deploying AICOFactory...");
    aicoProxy = await AICOFactory.deploy(aicoImpl.address, "0x");
    await aicoProxy.deployed();
    aico = await ethers.getContractAt("AICO", aicoProxy.address);

    // 4. Deploy BondingCurve
    const BondingCurve = await ethers.getContractFactory("BondingCurve");
    console.log("Deploying BondingCurve...");
    bondingCurve = await upgrades.deployProxy(BondingCurve, [mockBagToken.address, owner.address], {
      initializer: 'initialize',
      kind: 'uups'
    });
    await bondingCurve.deployed();

    // Set the curve parameters (matching Sepolia values)
    const A_VAL = ethers.utils.parseUnits("1.06", 18);
    const B_VAL = ethers.utils.parseUnits("0.023", 18);
    await bondingCurve.updateCurveParameters(A_VAL, B_VAL);

    // 5. Deploy PoolCreationSubsidy
    const PoolCreationSubsidy = await ethers.getContractFactory("PoolCreationSubsidy");
    console.log("Deploying PoolCreationSubsidy...");
    poolSubsidy = await upgrades.deployProxy(PoolCreationSubsidy, [owner.address, owner.address], {
      initializer: 'initialize',
      kind: 'uups'
    });
    await poolSubsidy.deployed();

    // 6. Deploy ProtocolRewards
    const ProtocolRewards = await ethers.getContractFactory("ProtocolRewards");
    protocolRewards = await ProtocolRewards.deploy();
    await protocolRewards.deployed();

    // 7. Initialize AICO
    console.log("Initializing AICO Proxy...");
    await aico.initialize(
      owner.address,          // tokenCreator
      owner.address,          // platformReferrer
      bondingCurve.address,   // bondingCurve
      owner.address,          // agentWallet
      mockBagToken.address,   // Using mock BAG for local testing
      "myAgentTokenURI",
      "AgentToken",
      "AGT",
      poolSubsidy.address,
      owner.address,          // Using owner as fake Uniswap factory for local test
      owner.address,          // protocolFeeRecipient
      protocolRewards.address
    );

    // 8. Authorize the AICO proxy in PoolCreationSubsidy
    await poolSubsidy.setAuthorizedCaller(aicoProxy.address, true);
    console.log("AICO Proxy authorized in PoolCreationSubsidy");

    // 9. Mint mock BAG to user & approve (only possible in local testing)
    await mockBagToken.mint(user.address, ethers.utils.parseUnits("10000", 18));
    await mockBagToken.connect(user).approve(aico.address, ethers.constants.MaxUint256);
  });

  it("Should buy and distribute fees", async() => {
    const bagSpend = ethers.utils.parseUnits("1000", 18);
    const minTokensOut = 1;
    const userBagBefore = await mockBagToken.balanceOf(user.address);

    // Make a buy
    await aico.connect(user).buy(
      user.address,
      ethers.constants.AddressZero, // no explicit order ref => goes to protocol
      "TestBuy",
      bagSpend,
      minTokensOut,
      (await ethers.provider.getBlock("latest")).timestamp + 300
    );

    const userBagAfter = await mockBagToken.balanceOf(user.address);
    expect(userBagBefore.sub(userBagAfter)).to.equal(bagSpend);

    // Check fee distribution in ProtocolRewards
    // total fee = 1% => 10 BAG
    // tokenCreator: 5 BAG (50%)
    // protocolFeeRecipient: 2.5 BAG (25%)
    // platformReferrer: 1 BAG (10%)
    // orderReferrer: 1.5 BAG (15%) => also protocol if address(0)

    const fee = bagSpend.div(100); 
    const tokenCreatorCut = fee.mul(5000).div(10000); // 50% = 5 BAG
    const protocolCut = fee.mul(2500).div(10000);     // 25% = 2.5 BAG
    const platformCut = fee.mul(1000).div(10000);     // 10% = 1 BAG
    const orderCut = fee.mul(1500).div(10000);        // 15% = 1.5 BAG

    // Because we passed address(0), orderReferrer fees go to protocol
    // So protocol gets 2.5 + 1.5 = 4 BAG total
    const totalFee = fee;
    expect(tokenCreatorCut.add(protocolCut).add(platformCut).add(orderCut)).to.equal(totalFee);

    // Check protocolRewards balances
    // Note: In this test, owner is both tokenCreator & protocolFeeRecipient
    // In production these would typically be different addresses
    const bagInProtocol = await protocolRewards.tokenBalanceOf(mockBagToken.address, owner.address);
    
    // Verify total fees collected matches expected amount
    expect(bagInProtocol).to.equal(totalFee);

    console.log("Test buy completed and fees distributed correctly");
  });
});
