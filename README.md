## Current deployed addresses:
These addresses can be found on the Sepolia Testnet:

Protocol Rewards Contract address: 0xb2ae29742A350F924b870E4aDBAbb967f5DeE8d4

Bonding Curve address 0xe6835433f9a95E12128754168D117696a42Ea372

Bag Token address: 0xCafEb3Dd19F644F06023C9064F8fd1f87Ac95e0A

Bag Governance address: 0xBEf7BF7CB7dAd814F8e3e27D47B973514F78F616

Bag Factory Implementation address: 0x200F3DD6A459FCd5314498CCe2A3B4E9D2e2e391

BagFactory address: 0x2bD6Dee3BfD167bC48D017604e8c6Efa1A0Be3e9



All contracts are verified.

## Testing using the mainnet fork:
You can use your own address to deploy and test contracts on a mainnet fork. Simply copy your private key and rpc endpoint over to a secret.json file and store it in the cloned repository.
You can run tests already present in this repository by entering:

```
 npx hardhat test tests/amendment_tests.js 
 npx hardhat test tests/market_graduation_tests.js
 ```

 ## Deploying via script:
 There is a script included to deploy the contracts on Sepolia. It is present in the scripts/ folder. You can run the script using hardhat with the following command:

 ```
 npx hardhat run scripts/sepolia_deployment.js --network sepolia

 ```

 Make sure you add the necessary credentials to a secret.json file in the folder before running the script or compiling the code. Add your private key and RPC endpoint in the following manner:

```json
 {
    "key":"PUT PRIVATE KEY HERE",
    "url":"PUT ENDPOINT URL HERE"
 }
 ```

 Make sure the addresses in the test and deployment scripts are pointing to deployed instances on the same chain as your endpoint url.