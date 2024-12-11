const { ethers } = require("hardhat");

async function main() {
    // get the contracts off the mainnet
    // WETH
    // nonfungiblePositionManager Uniswap v3
    // _swapRouter Uniswap V3
    const protocol_fee_recipient = "0x8aEa0700A9919C5EeFF164611F24DC065Ba77636"
    // get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the deployer account:", deployer.address);
    // checking the balance in the deployer account
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    // get the contracts off the mainnet
    // WETH
    // nonfungiblePositionManager Uniswap v3
    // _swapRouter Uniswap V3
    const WETH_target = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
    const nonfungiblePositionManager_target = "0x1238536071E1c677A632429e3655c799b22cDA52";
    const swaprouter_target = "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E";

    // preparing deployment variables
    const protocolrewards = await ethers.getContractFactory("ProtocolRewards");
    const bondingcurve = await ethers.getContractFactory("BondingCurve");
    const bagtokencontract = await ethers.getContractFactory("Bag");
    const bagfactoryimpl = await ethers.getContractFactory("BagFactoryImpl");
    const bagfactory = await ethers.getContractFactory("BagFactory");

    // deploying the contracts
    const ProtocolRewards = await protocolrewards.deploy();
    const BondingCurve = await bondingcurve.deploy();
    const BagTokenImpl = await bagtokencontract.deploy(protocol_fee_recipient,ProtocolRewards.target,WETH_target,nonfungiblePositionManager_target, swaprouter_target);
    const BagFactoryImpl = await bagfactoryimpl.deploy(BagTokenImpl.target, BondingCurve.target);

    // Encode the initialization parameters
    const initializeData = bagfactoryimpl.interface.encodeFunctionData("initialize", [protocol_fee_recipient]);
    console.log("encoded params:", initializeData);
    const BagFactory = await bagfactory.deploy(BagFactoryImpl.target, initializeData); // can alternatively be set to 0 by inputting "0x" instead

    // Deploy governance token
    const governance_contract = await ethers.getContractFactory("BagGovernor");
    const bag_governance = await governance_contract.deploy();

    // Print out contract addresses
    console.log("Protocol Rewards Contract address:", ProtocolRewards.target);
    console.log("Bonding Curve address", BondingCurve.target);
    console.log("Bag Token address:", BagTokenImpl.target);
    console.log("Bag Factory Implementation address:", BagFactoryImpl.target);
    console.log("BagFactory address:", BagFactory.target);
    console.log("Bag Governance address:", bag_governance.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });