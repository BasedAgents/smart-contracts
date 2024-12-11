## Current deployed addresses:
These addresses can be found on the Sepolia Testnet:

Protocol Rewards Contract address: 0x9EAE1234A4a26c5bFD778e1533796dE2cF7352B1

Bonding Curve address 0x021aE16F7AA807b3cC96625CC30Ae40FcA374bc0

Bag Token address: 0x7cDe2C49728F3c57e53BbF635D80ab7D59BF5632

Bag Factory Implementation address: 0x9C98056141FC87e70100f7046FD1B22729d907e2

BagFactory address: 0x8DA85B822aC8767F6A987F0A662039734CC4f066


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