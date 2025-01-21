require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");

describe("AICO Flow on Sepolia", function () {
  let owner, user;
  let addresses; // We'll load from a JSON file
  let bagToken;
  let aico;

  const BAG_TOKEN_ADDRESS = process.env.BAG_TOKEN_ADDRESS;

  before(async function () {
    // 1) Get signers
    [owner, user] = await ethers.getSigners();

    // 2) Load addresses from file
    const data = fs.readFileSync("deployedAddresses.sepolia.json", "utf-8");
    addresses = JSON.parse(data);

    console.log("Loaded addresses from JSON:", addresses);

    // 3) Get references to existing contracts
    bagToken = await ethers.getContractAt("IERC20", BAG_TOKEN_ADDRESS);
    aico = await ethers.getContractAt("AICO", addresses.aico);
  });

  it("Should do a small buy on the BondingCurve", async function () {
    // Ensure user has some BAG
    const userBagBal = await bagToken.balanceOf(user.address);
    expect(userBagBal).to.be.gt(0, "User needs BAG on Sepolia");

    // Approve
    await bagToken.connect(user).approve(addresses.aico, userBagBal);

    // Call AICO.buy(...) with 1 BAG
    const buyAmount = ethers.parseUnits("1", 18);
    await aico.connect(user).buy(
      user.address,
      ethers.ZeroAddress,
      "TestBuy",
      buyAmount,
      0, // minimal slippage
      BigInt((await ethers.provider.getBlock("latest")).timestamp + 300)
    );

    // Check user minted tokens
    const userTokens = await aico.balanceOf(user.address);
    console.log("User minted tokens =>", userTokens.toString());
    expect(userTokens).to.be.gt(0);
  });

  // Additional tests:
  // e.g. partial fill, graduation, uniswap buy
  // but remember, for a post-graduation buy to succeed,
  // your `_graduateToUniswap()` must do addLiquidity to the real router.
});
