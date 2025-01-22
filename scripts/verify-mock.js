const { run } = require("hardhat");

async function main() {
  const address = "0x892b7C6AD9B133Da227f29d225d20b83b6A183E2";
  const constructorArgs = ["BAG Token", "BAG"];

  console.log("Verifying MockBAGToken...");
  try {
    await run("verify:verify", {
      address: address,
      constructorArguments: constructorArgs
    });
    console.log("MockBAGToken verified successfully");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("MockBAGToken is already verified");
    } else {
      console.log("Error verifying MockBAGToken:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 