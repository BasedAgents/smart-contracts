const hre = require("hardhat");
const { ethers, upgrades } = require("hardhat");

async function main() {
    // Proxy addresses
    const BONDING_CURVE_PROXY = "0xC323B369b7F1fe341BCCca0236fa9EA1cB119320";
    const POOL_CREATION_SUBSIDY_PROXY = "0xaBCeB7766464f0A57A9A477366339f727728c7B2";
    const AICO_FACTORY_PROXY = "0x148eea31e41371eFf65E9816a8d95Fc936DDF2E6";

    // Get implementation addresses
    const bondingCurveImpl = await upgrades.erc1967.getImplementationAddress(BONDING_CURVE_PROXY);
    console.log("BondingCurve Implementation:", bondingCurveImpl);

    const poolCreationSubsidyImpl = await upgrades.erc1967.getImplementationAddress(POOL_CREATION_SUBSIDY_PROXY);
    console.log("PoolCreationSubsidy Implementation:", poolCreationSubsidyImpl);

    const aicoFactoryImpl = await upgrades.erc1967.getImplementationAddress(AICO_FACTORY_PROXY);
    console.log("AICOFactory Implementation:", aicoFactoryImpl);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 