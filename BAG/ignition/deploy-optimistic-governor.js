const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("OptimisticGovernorDeployer", (m) => {
    const bagTokenAddress = "0x5bEe1C617721E743e420AB6650BfC808365a0a82"; // Your BAG Token proxy address
    const aiAgent = "0x552375B8BC807F30065Dca9A5828B645D64F53Ab"; // Replace with your AI agent address
    const dailyLimit = ethers.parseEther("10000"); // Example: 10,000 tokens daily limit
    const timeLock = 2 * 24 * 60 * 60; // 2 days in seconds
    const guardianEpochDuration = 50400; // ~1 week in blocks (assuming 12s block time)

    const optimisticGovernor = m.contract('OptimisticBAGGovernor');
    
    const proxy = m.upgrade( 
        optimisticGovernor,
        [
            bagTokenAddress,       // token address
            aiAgent,              // AI agent address
            dailyLimit,           // daily spending limit
            timeLock,            // timelock duration
            guardianEpochDuration // guardian epoch duration
        ],
        {
            constructorArgs: [],
            initializer: "initialize",
            kind: "uups",
        }
    );

    return { proxy };
});