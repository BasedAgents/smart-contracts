const { expect } = require("chai");
const { ethers } = require("hardhat");
const { upgrades } = require("hardhat");

describe("Bonding Curve Parameters Test", function() {
  let bondingCurve, mockBagToken;

  before(async() => {
    const [owner] = await ethers.getSigners();

    // Deploy mock BAG token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockBagToken = await MockERC20.deploy("Mock BAG", "mBAG");
    await mockBagToken.waitForDeployment();
    const mockBagAddress = await mockBagToken.getAddress();
    console.log("Deployed Mock BAG token");

    // Deploy BondingCurve (UUPS proxy)
    const BondingCurve = await ethers.getContractFactory("BondingCurve");
    console.log("Deploying BondingCurve...");
    bondingCurve = await upgrades.deployProxy(
      BondingCurve,
      [mockBagAddress, owner.address],
      {
        initializer: "initialize",
        kind: "uups"
      }
    );
    await bondingCurve.waitForDeployment();

    // Set bonding curve parameters
    // B = 1.386294361e9 (~ 1.386294e-9 in real decimals)
    const B_VAL = ethers.parseUnits("1386294361", 0);  // No decimals needed since it's a raw number
    // A = 5.824364e13 (~ 5.824364e-5 in real decimals)
    const A_VAL = ethers.parseUnits("58243640000000", 0);  // No decimals needed since it's a raw number
    await bondingCurve.updateCurveParameters(A_VAL, B_VAL);
    console.log("Setting curve parameters:", { A: A_VAL.toString(), B: B_VAL.toString() });
  });

  it("Should verify token minting amounts for different BAG inputs", async() => {
    const bagOrderSizes = [10000, 20000, 30000, 40000, 42000];  // in "raw" BAG (no decimals)
    
    console.log("\nVerifying token minting amounts for different BAG inputs:");
    console.log("Expected results:");
    console.log("10k BAG → ~154–155 million tokens");
    console.log("20k BAG → ~280 million tokens"); 
    console.log("30k BAG → ~389 million tokens");
    console.log("40k BAG → ~482 million tokens");
    console.log("42k BAG → ~500 million tokens\n");
    
    console.log("Actual results:");
    for (const rawBag of bagOrderSizes) {
      const bagInWei = ethers.parseUnits(rawBag.toString(), 18);
      const minted = await bondingCurve.getBAGBuyQuote(0, bagInWei);
      console.log(`Buying ${rawBag} BAG mints ~ ${ethers.formatUnits(minted, 0)} tokens`);
    }
  });
}); 