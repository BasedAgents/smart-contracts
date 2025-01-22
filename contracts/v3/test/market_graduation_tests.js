//const hre = require("hardhat");
const { ethers } = require("hardhat");

// deployment variables
let ProtocolRewards;
let BondingCurve;
let BagTokenImpl;
let BagFactoryImpl;
let BagFactory;
let deployer;
let deployedTokenAddress;
let deployedToken;
let WETH;

// start test block
describe("Market Graduation test", function () {

    beforeEach(async function () {
        await setupBag();
    });

   it("deploying bag contracts", async function () {
        // Print out contract targetes
        console.log("Protocol Rewards Contract target:", ProtocolRewards.target);
        console.log("Bonding Curve target", BondingCurve.target);
        console.log("Bag Token target:", BagTokenImpl.target);
        console.log("Bag Factory Implementation target:", BagFactoryImpl.target);
        console.log("BagFactory target:", BagFactory.target);
        console.log("Bag contracts successfully deployed");
    })

    it("Bonding Curve test", async function () {
        const eth_value = await ethers.parseEther("0.02");
        await deployAgent();
        const tx = await deployedToken.buy(deployer.address,deployer.address,deployer.address," ", 0, 0, 0,{value: eth_value}); // the function that emits the event
        const receipt = await tx.wait();
        const event1 = receipt.logs.find(log =>
            log.topics[0] === ethers.id("BagTokenBuy(address,address,address,uint256,uint256,uint256,uint256,uint256,string,uint256,uint8)")
        );
        const decodedEvent1 = deployedToken.interface.parseLog(event1);
        // Log out all values
        console.log({
            sender: decodedEvent1.args[0],
            recipient: decodedEvent1.args[1],
            orderReferrer: decodedEvent1.args[2],
            value: decodedEvent1.args[3],
            fee: decodedEvent1.args[4],
            totalCost: decodedEvent1.args[5],
            trueOrderSize: decodedEvent1.args[6],
            balanceOf: decodedEvent1.args[7],
            comment: decodedEvent1.args[8],
            totalSupply: decodedEvent1.args[9],
            marketType: decodedEvent1.args[10],
        });
    })

    it("Uniswap Graduation test", async function () {
        const eth_value = await ethers.parseEther("10");
        await deployAgent();
        const tx = await deployedToken.buy(deployer.address,deployer.address,deployer.address," ", 0, 0, 0,{value: eth_value}); // the function that emits the event
        const receipt = await tx.wait();

        // Find the BagMarketGraduated event
        const event = receipt.logs.find(log => 
         log.topics[0] === ethers.id("BagMarketGraduated(address,address,uint256,uint256,uint256,uint8)")
        );

        // Decode the event
        const decodedEvent = deployedToken.interface.parseLog(event);

        // Log out all values
        console.log({
        bagAddress: decodedEvent.args[0],      // address(this)
        poolAddress: decodedEvent.args[1],     // poolAddress
        ethLiquidity: ethers.formatEther(decodedEvent.args[2]),  // ethLiquidity in ETH
        secondaryMarketSupply: decodedEvent.args[3],  // SECONDARY_MARKET_SUPPLY
        positionId: decodedEvent.args[4],      // positionId
        marketType: decodedEvent.args[5]       // marketType
    });
        const tx1 = await deployedToken.connect(user).buy(user.address,user.address,user.address," ", 1,0,0,{value:eth_value});
        const receipt1 = await tx1.wait();
        const event1 = receipt1.logs.find(log =>
            log.topics[0] === ethers.id("BagTokenBuy(address,address,address,uint256,uint256,uint256,uint256,uint256,string,uint256,uint8)")
        );
        const decodedEvent1 = deployedToken.interface.parseLog(event1);
        // Log out all values
        console.log({
            sender: decodedEvent1.args[0],
            recipient: decodedEvent1.args[1],
            orderReferrer: decodedEvent1.args[2],
            value: decodedEvent1.args[3],
            fee: decodedEvent1.args[4],
            totalCost: decodedEvent1.args[5],
            trueOrderSize: decodedEvent1.args[6],
            balanceOf: decodedEvent1.args[7],
            comment: decodedEvent1.args[8],
            totalSupply: decodedEvent1.args[9],
            marketType: decodedEvent1.args[10],
        });

    })

})

// deployment function
async function setupBag() {
    // get the deployer account
    [deployer,user] = await ethers.getSigners();
    console.log("Deploying contracts with the deployer account:", deployer.address);
    // checking the balance in the deployer account
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    // get the contracts off the mainnet
    // WETH
    // nonfungiblePositionManager Uniswap v3
    // _swapRouter Uniswap V3
    const WETH_target = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const nonfungiblePositionManager_target = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
    const swaprouter_target = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";

    // preparing deployment variables
    const protocolrewards = await ethers.getContractFactory("ProtocolRewards");
    const bondingcurve = await ethers.getContractFactory("BondingCurve");
    const bagtokencontract = await ethers.getContractFactory("Bag");
    const bagfactoryimpl = await ethers.getContractFactory("BagFactoryImpl");
    const bagfactory = await ethers.getContractFactory("BagFactory");

    // deploying the contracts
    ProtocolRewards = await protocolrewards.deploy();
    BondingCurve = await bondingcurve.deploy();
    BagTokenImpl = await bagtokencontract.deploy(deployer.address,ProtocolRewards.target,WETH_target,nonfungiblePositionManager_target, swaprouter_target);
    BagFactoryImpl = await bagfactoryimpl.deploy(BagTokenImpl.target, BondingCurve.target);

    // Encode the initialization parameters
    const initializeData = bagfactoryimpl.interface.encodeFunctionData("initialize", [deployer.address]);
    console.log("encoded params:", initializeData);
    BagFactory = await bagfactory.deploy(BagFactoryImpl.target, initializeData); // can alternatively be set to 0 by inputting "0x" instead
}

async function deployAgent() {
        const eth_value = ethers.parseEther("0.01");
        console.log("Bag Factory Implementation target:", BagFactoryImpl.target);
        const tx = await BagFactoryImpl.deploy(deployer.address, deployer.address, ",,","Test","TT", {value: eth_value});
         // Wait for the transaction to be mined
        const receipt = await tx.wait();
        const event = receipt.logs.find(log => 
            log.topics[0] === ethers.id("BagTokenCreated(address,address,address,address,address,string,string,string,address,address)")
        );
        const decodedEvent = BagFactoryImpl.interface.parseLog(event);
        const deployedTokenAddress = decodedEvent.args[8]; // token address is the 9th parameter
        
        console.log("Deployed Bag Token Address:", deployedTokenAddress);
        // attaching deployed bag token object
        const bagtokencontract = await ethers.getContractFactory("Bag");
        deployedToken = bagtokencontract.attach(deployedTokenAddress);
        console.log("Bag Token Creator:", await deployedToken.tokenCreator())
}