const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Agent Token Creation and Initial Supply Distribution", function () {
  let aico;
  let aicoFactory;
  let bondingCurve;
  let owner;
  let agentWallet;
  let bagToken;

  // Contract addresses from Sepolia deployment
  const BAG_TOKEN_ADDRESS = "0x780DB7650ef1F50d949CB56400eE03052C7853CC";
  const BONDING_CURVE_ADDRESS = "0xC323B369b7F1fe341BCCca0236fa9EA1cB119320";
  const AICO_FACTORY_ADDRESS = "0x148eea31e41371eFf65E9816a8d95Fc936DDF2E6";

  const TOTAL_SUPPLY = ethers.parseEther("1000000000"); // 1B tokens
  const AGENT_WALLET_SUPPLY = ethers.parseEther("300000000"); // 300M tokens
  const BONDING_CURVE_SUPPLY = ethers.parseEther("500000000"); // 500M tokens
  const UNISWAP_RESERVE = ethers.parseEther("200000000"); // 200M tokens
  const CREATION_FEE = ethers.parseEther("100"); // 100 BAG tokens

  before(async function () {
    // Get signers
    [owner] = await ethers.getSigners();
    
    // Create a new wallet for the agent
    agentWallet = ethers.Wallet.createRandom().connect(ethers.provider);

    // Get contract instances using interfaces
    bagToken = await ethers.getContractAt("IERC20", BAG_TOKEN_ADDRESS);
    bondingCurve = await ethers.getContractAt("BondingCurve", BONDING_CURVE_ADDRESS);
    aicoFactory = await ethers.getContractAt("IAICOFactory", AICO_FACTORY_ADDRESS);

    // Check BAG token balance
    const bagBalance = await bagToken.balanceOf(owner.address);
    console.log("BAG token balance:", ethers.formatEther(bagBalance), "BAG");
    if (bagBalance < CREATION_FEE) {
      throw new Error(`Insufficient BAG tokens. Need ${ethers.formatEther(CREATION_FEE)} BAG but have ${ethers.formatEther(bagBalance)} BAG`);
    }

    // Approve BAG tokens for creation fee
    const approveTx = await bagToken.approve(AICO_FACTORY_ADDRESS, CREATION_FEE);
    await approveTx.wait();

    // Deploy a new AICO token through the factory
    const deployTx = await aicoFactory.deploy(
        owner.address,  // _agentCreator - will have governance rights
        ethers.ZeroAddress, // _platformReferrer
        await agentWallet.getAddress(), // _agentWallet - where agent's funds will be sent
        "ipfs://test",
        "Test Agent",
        "TEST",
        172800,  // 48 hours voting delay
        50400,   // 14 hours voting period
        ethers.parseEther("100000") // 100k token proposal threshold
    );
    
    const receipt = await deployTx.wait();
    const event = receipt.logs.find(log => log.fragment && log.fragment.name === "AICOTokenCreated");
    const tokenAddress = event.args.tokenAddress;
    
    // Get AICO token instance
    aico = await ethers.getContractAt("IERC20", tokenAddress);
  });

  describe("Initial Supply Distribution", function () {
    it("should have correct total supply of 1B tokens", async function () {
      const totalSupply = await aico.totalSupply();
      expect(totalSupply).to.equal(TOTAL_SUPPLY);
    });

    it("should allocate 300M tokens to Agent's wallet", async function () {
      const agentBalance = await aico.balanceOf(await agentWallet.getAddress());
      expect(agentBalance).to.equal(AGENT_WALLET_SUPPLY);
    });

    it("should allocate 500M tokens to bonding curve", async function () {
      const bondingCurveBalance = await aico.balanceOf(BONDING_CURVE_ADDRESS);
      expect(bondingCurveBalance).to.equal(BONDING_CURVE_SUPPLY);
    });

    it("should reserve 200M tokens for Uniswap pool", async function () {
      const reserveBalance = await aico.balanceOf(await aico.getAddress());
      expect(reserveBalance).to.equal(UNISWAP_RESERVE);
    });

    it("should have all tokens accounted for", async function () {
      const agentBalance = await aico.balanceOf(await agentWallet.getAddress());
      const bondingCurveBalance = await aico.balanceOf(BONDING_CURVE_ADDRESS);
      const reserveBalance = await aico.balanceOf(await aico.getAddress());
      
      const totalDistributed = agentBalance + bondingCurveBalance + reserveBalance;
      expect(totalDistributed).to.equal(TOTAL_SUPPLY);
    });
  });
}); 