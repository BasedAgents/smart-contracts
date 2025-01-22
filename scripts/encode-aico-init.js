const { Interface } = require('@ethersproject/abi');

async function main() {
  // Parameters to encode
  const name = "Test Agent";
  const symbol = "TEST";
  const platformReferrer = "0x82fED030C262ec0262624aaD0a17A0d1eDA24EA1";

  // Create interface with initialization function
  const iface = new Interface([
    "function initialize(string name, string symbol, address platformReferrer)"
  ]);

  // Encode the function call
  const encodedData = iface.encodeFunctionData("initialize", [
    name,
    symbol,
    platformReferrer
  ]);

  console.log("\nParameters being encoded:");
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Platform Referrer:", platformReferrer);
  console.log("\nEncoded aicoInitData:");
  console.log(encodedData);
  console.log("\nYou can use this value directly in the createAICOWithGovernor function on Etherscan");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 