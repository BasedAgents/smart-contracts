const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");

async function main() {
    const factoryAddress = "0xe818983aAC79AFb69C39b7ec19d1EC67b90452Ff";
    const implAddress = await upgrades.erc1967.getImplementationAddress(factoryAddress);
    console.log(implAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 