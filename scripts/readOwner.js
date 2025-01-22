const { ethers } = require("hardhat");

async function main() {
  const PROXY_ADDRESS = "0xdcC56e42d8636CF34454dDE4291244842d722267";
  
  // Get the owner using the raw function selector for owner()
  const provider = ethers.provider;
  const ownerData = await provider.call({
    to: PROXY_ADDRESS,
    data: "0x8da5cb5b" // function selector for owner()
  });
  
  // Properly format the address from the raw bytes
  const ownerAddress = "0x" + ownerData.slice(26);
  console.log("Owner address (raw call):", ownerAddress);

  // Also try with contract interface
  const BondingCurve = await ethers.getContractFactory("BondingCurve");
  const bondingCurve = BondingCurve.attach(PROXY_ADDRESS);
  const owner = await bondingCurve.owner();
  console.log("Owner address (interface):", owner);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 