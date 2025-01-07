const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("BondingCurve", function () {
    let bondingCurve;
    let bagToken;
    let owner;

    const INITIAL_PRICE = ethers.parseEther("1.06");  // 1.06 BAG
    const TOTAL_SUPPLY = 800_000_000;  // 800M tokens
    const TOTAL_BAG_REQUIRED = ethers.parseEther("42000");  // 42k BAG

    beforeEach(async function () {
        [owner] = await ethers.getSigners();
        
        // Deploy mock BAG token for testing
        const MockBAG = await ethers.getContractFactory("MockERC20");
        bagToken = await MockBAG.deploy("BAG Token", "BAG");
        
        // Deploy BondingCurve
        const BondingCurve = await ethers.getContractFactory("BondingCurve");
        bondingCurve = await BondingCurve.deploy(await bagToken.getAddress());
    });

    describe("Price Points Verification", function () {
        it("Should have correct initial price", async function () {
            const quote = await bondingCurve.getTokenBuyQuote(0, ethers.parseEther("1"));
            expect(quote).to.be.closeTo(
                INITIAL_PRICE,
                ethers.parseEther("0.01")  // Allow 0.01 BAG deviation
            );
        });

        it("Should have correct price at 100M tokens", async function () {
            const supply = 100_000_000;
            const quote = await bondingCurve.getTokenBuyQuote(supply, ethers.parseEther("1"));
            expect(quote).to.be.closeTo(
                ethers.parseEther("4.24"),
                ethers.parseEther("0.1")
            );
        });

        it("Should have correct price at 400M tokens", async function () {
            const supply = 400_000_000;
            const quote = await bondingCurve.getTokenBuyQuote(supply, ethers.parseEther("1"));
            expect(quote).to.be.closeTo(
                ethers.parseEther("68.12"),
                ethers.parseEther("1")
            );
        });

        it("Should have correct price at 800M tokens", async function () {
            const supply = 800_000_000;
            const quote = await bondingCurve.getTokenBuyQuote(supply, ethers.parseEther("1"));
            expect(quote).to.be.closeTo(
                ethers.parseEther("4634.21"),
                ethers.parseEther("50")
            );
        });

        it("Should require approximately 42k BAG for full purchase", async function () {
            // Calculate total BAG needed by summing up small purchases
            let totalBAG = ethers.parseEther("0");
            let currentSupply = 0;
            const purchaseSize = 1_000_000; // 1M tokens at a time
            
            for(let i = 0; i < TOTAL_SUPPLY; i += purchaseSize) {
                const quote = await bondingCurve.getTokenBuyQuote(
                    currentSupply,
                    purchaseSize
                );
                totalBAG = totalBAG + quote;
                currentSupply += purchaseSize;
            }

            expect(totalBAG).to.be.closeTo(
                TOTAL_BAG_REQUIRED,
                ethers.parseEther("100") // Allow 100 BAG deviation
            );
        });
    });
}); 