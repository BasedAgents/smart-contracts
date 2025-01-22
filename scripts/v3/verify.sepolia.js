require("dotenv").config();
const { run } = require("hardhat");

async function main() {
  const contracts = {
    // Core Logic Contracts
    "BondingCurve Logic": {
      address: "0x4a3Dc349011E52d9970d1cb99363eB3484b33Bbf",
      constructorArgs: []
    },
    "ProtocolRewards": {
      address: "0xD0AD1FDA6Bda09ea5cff81ccAaf56eB5E60cdb4c",
      constructorArgs: []
    },
    "PoolCreationSubsidy Logic": {
      address: "0xf45d8D7c51ff65fCD25CDF692a154D3626Be0B7b",
      constructorArgs: []
    },
    "AICO Logic": {
      address: "0xB51EBf00B54C8a31ef5076F3D77A201637Bde963",
      constructorArgs: []
    },
    "Governor Logic": {
      address: "0x3c21c9bC638030AC0ea30ba76d00184d4940b265",
      constructorArgs: []
    },
    "AICOFactory Logic": {
      address: "0x1A662028cA2EdF1D14aF1cD05602C4AEbe417631",
      constructorArgs: []
    }
  };

  // Proxy contracts need special verification
  const proxyContracts = {
    "BondingCurve Proxy": {
      address: "0xf85dDb30e8cDEE17dA5dD9526eE7951F50fe914F",
      kind: "transparent"
    },
    "PoolCreationSubsidy Proxy": {
      address: "0xA125e5E0366C4d9F7435227F966d4a718c95c58F",
      kind: "transparent"
    },
    "AICOFactory Proxy": {
      address: "0xe3a9C604E31197FB817077e01dB01a384B27BD5A",
      kind: "transparent"
    },
    "AICO Runtime": {
      address: "0xBE93B86ca2f90D5408cF163151dfE0fD1fdcFBa1",
      kind: "transparent"
    },
    "Governor Runtime": {
      address: "0xC2b28e195ecB9d3d568Cb94FE9c0A960791e728a",
      kind: "transparent"
    }
  };

  console.log("Starting contract verification...");

  // First verify all logic contracts
  for (const [name, contract] of Object.entries(contracts)) {
    try {
      console.log(`\nVerifying ${name}...`);
      await run("verify:verify", {
        address: contract.address,
        constructorArguments: contract.constructorArgs
      });
      console.log(`✅ ${name} verified successfully`);
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log(`⚠️ ${name} was already verified`);
      } else {
        console.error(`❌ Failed to verify ${name}:`, error);
        console.error("Error details:", error.message);
      }
    }
  }

  // Then verify proxies
  console.log("\nVerifying proxy contracts...");
  for (const [name, proxy] of Object.entries(proxyContracts)) {
    try {
      console.log(`\nVerifying ${name} as ${proxy.kind} proxy...`);
      await run("verify:verify", {
        address: proxy.address,
        constructorArguments: []
      });
      console.log(`✅ ${name} verified successfully`);
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log(`⚠️ ${name} was already verified`);
      } else {
        console.error(`❌ Failed to verify ${name}:`, error);
        console.error("Error details:", error.message);
      }
    }
  }

  console.log("\nVerification complete!");
  console.log("\nNOTE: For proxy contracts, you'll need to manually verify the proxy setup on Etherscan:");
  console.log("1. Go to the proxy contract on Etherscan");
  console.log("2. Click 'More Options' -> 'Is this a proxy?'");
  console.log("3. Click 'Verify' to verify the proxy implementation");
  console.log("4. The implementation contract should already be verified");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 