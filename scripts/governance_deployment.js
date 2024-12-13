const { ethers, upgrades } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Account Balance:", (await deployer.provider.getBalance(deployer.address)).toString());
    const BagTokenAddress = "0xe626A1C578C2Fd778766330Ebb4c5B17258Bc18E";
    const votingDelay = 50;
    const votingPeriod = 17280;
    const proposalThreshold = ethers.parseUnits('1000', 18);
    const GovernanceContract = await ethers.getContractFactory("TallyCompatibleGovernor");
    const BagGovernor = await upgrades.deployProxy(GovernanceContract,[
        BagTokenAddress,
        votingDelay,
        votingPeriod,
        proposalThreshold,
        10
    ]);
    await BagGovernor.waitForDeployment();
    console.log("BagGovernor deployed to:", BagGovernor.target);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });