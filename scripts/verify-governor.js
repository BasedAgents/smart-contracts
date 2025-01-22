require("dotenv").config();
const { run } = require("hardhat");

async function main() {
  // Governor addresses
  const GOVERNOR_PROXY = "0xC2b28e195ecB9d3d568Cb94FE9c0A960791e728a";
  const GOVERNOR_LOGIC = "0x3c21c9bC638030AC0ea30ba76d00184d4940b265";

  console.log("Verifying Governor contracts...");

  try {
    // First verify the logic contract
    console.log("\nVerifying Governor Logic implementation...");
    await run("verify:verify", {
      address: GOVERNOR_LOGIC,
      constructorArguments: []
    });
    console.log("✅ Governor Logic verified");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("⚠️ Governor Logic was already verified");
    } else {
      console.error("❌ Failed to verify Governor Logic:", error);
    }
  }

  try {
    // Then verify the proxy with explicit contract type
    console.log("\nVerifying Governor Proxy...");
    await run("verify:verify", {
      address: GOVERNOR_PROXY,
      constructorArguments: [
        GOVERNOR_LOGIC, // implementation address
        "0x" // initialization data (empty in this case)
      ],
      contract: "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy"
    });
    console.log("✅ Governor Proxy verified");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("⚠️ Governor Proxy was already verified");
    } else {
      console.error("❌ Failed to verify Governor Proxy:", error);
    }
  }

  console.log("\nNOTE: After verification completes:");
  console.log("1. Go to the proxy contract on Etherscan:", GOVERNOR_PROXY);
  console.log("2. Click 'More Options' -> 'Is this a proxy?'");
  console.log("3. Click 'Verify' to verify the proxy implementation");
  console.log("4. The implementation contract should be verified");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 