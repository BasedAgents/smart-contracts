const { ethers, upgrades } = require("hardhat");

async function main() {
  const PROXY_ADDRESS = "0xdcC56e42d8636CF34454dDE4291244842d722267";
  
  const implAddress = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
  console.log("Implementation address:", implAddress);

  const BondingCurve = await ethers.getContractFactory("BondingCurve");
  const bondingCurve = await BondingCurve.attach(PROXY_ADDRESS);
  
  const owner = await bondingCurve.owner();
  console.log("Owner address:", owner);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 