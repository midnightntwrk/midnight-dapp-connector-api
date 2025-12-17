# Midnight DApp connector API

This API provides a comprehensive interface for the DApp - Wallet connection, defining the structure of the data and operations available.

The [Specification](./SPECIFICATION.md) document describes in more detail expected implementation and usage.


## Installation

The Midnight DApp connector API is available as an NPM package with the namespace `@midnight-ntwrk/dapp-connector-api`. It can be installed using any node package manager, such as Yarn. To install the package using Yarn, execute the following command:

`yarn add @midnight-ntwrk/dapp-connector-api`

## Package usage

The package provides the type declarations that are documented in the [documentation](type-aliases/InitialAPI.md) of this package.

The DApp connector API should be exposed through the global variable as follows:

`window.midnight.{someWalletIdString}`

In this way multiple wallets can inject their API without causing conflicts, and a DApp can select/ask the user 
to which wallet connection should be established.


## Initial API data and methods

| Name | Description |
|------|-------------|
| **name** | Wallet name, expected to be displayed to the user |
| **icon** | Wallet icon, as an URL, either reference to a hosted resource, or a base64 encoded data URL |
| **apiVersion** | Version of the API implemented by this instance of the API. E.g. wallet implementing version 3.1.5 provides apiVersion with value '3.1.5'. This value lets DApps to differentiate between different versions of the API and implement appropriate logic for each version or not use some versions at all |
| **connect** | Connect to wallet, hinting desired network id. Upon successful connection returns a promise with [ConnectedAPI](type-aliases/ConnectedAPI.md) |


## API usage

### Connecting to a wallet

DApp needs to select the wallet it wants to connect to and call the `connect(networkId)` method, then wait for the returned promise. 
The promise may resolve with a significant delay, as most wallets might want to display a dialog asking user for an authorization.

```ts
try {
  const desiredNetworkId = 'mainnet'
  const api = await window.midnight.{selectedWalletId}.connect('mainnet');

  // api is available here
} catch (error) {
  console.log('an error occurred', error);
}
```


### Getting information about the wallet before connection

#### Name and icon
To get the name of the wallet, use the `name` property in the implemented DApp connector API, it is similar with the icon:

```ts
const name = window.midnight.{walletName}.name;
const iconURL = window.midnight.{walletName}.icon;

console.log('Wallet name', name);
console.log('Wallet icon URL', iconURL);
```

Both fields are meant to be displayed to the user to help with wallet selection. The DApp needs to ensure proper 
escaping though to prevent XSS vulnerabilities, e.g. display icon only through an `img` tag and display the name 
using `Text` node.

#### API version
To get the API version, use the `apiVersion` property as follows:

```ts
const apiVersion = window.midnight.{walletName}.apiVersion;

console.log('API version', apiVersion);
```

The DApp needs to verify whether the version reported by wallet (which needs to be a version of this package) matches 
DApp's expectance (e.g. using semver check)

### Once connected

Once connected, the DApp can issue many different requests to the wallet as defined by the [ConnectedAPI](type-aliases/ConnectedAPI.md) type. The most important ones are:
- query wallet for information, like balances or addresses
- query wallet for configuration, so that the DApp can connect to the same instance of Indexer, Midnight Node or Proof Server
- ask wallet to make a transfer, balance a transaction, make an unbalanced intent (e.g. for a swap) or sign data 
- ask wallet to submit a transaction

#### Getting the configuration

Midnight wallet users can configure the node, indexer, and proving server URIs in the wallet settings. DApps are expected to follow these configurations, so that user preferences are respected, which is important from privacy standpoint.

The returned object has following properties:
| Name | Description |
|------|-------------|
| **indexerUri** | Indexer HTTP URI |
| **indexerWsUri** | Indexer WebSocket URI |
| **proverServerUri** | Prover Server URI |
| **substrateNodeUri** | Substrate URI |
| **networkId** | Network id connected to - present here mostly for completness and to allow dapp validate it is connected to the network it wishes to |

To get the service URI config, use the API as follows:

```ts
try {
  const connected = await window.midnight.{selectedWalletId}.connect();
  const serviceUriConfig = await connected.getConfiguration();

  console.log('serviceUriConfig', serviceUriConfig);
} catch (error) {
  console.log('an error occurred', error);
}
```

#### Reading wallet information 

There are many methods present for querying for wallet state. The most important ones are `getShieldedBalances`, `getUnshieldedBalances`, `getDustBalance`, `getShieldedAddresses`, `getUnshieldedAddress` and `getDustAddress`. They can be used like below. Keys and addresses will be provided in Bech32m format, while shielded and unshielded balances will return a record, whose keys are token types.

```ts
try {
  const connected = await window.midnight.{selectedWalletId}.connect();
  const addressesAndBalances = {
    shieldedBalances: await connected.getShieldedBalances(),
    unshieldedBalances: await connected.getUnshieldedBalances(),
    dustBalance: await connected.getDustBalance(),
    shieldedAddresses: await connected.getShieldedAddresses(),
    unshieldedAddress: await connected.getUnshieldedAddress(),
    dustAddress: await connected.getDustAddress(),
  }

  console.log('addressesAndBalances', addressesAndBalances);
} catch (error) {
  console.log('an error occurred', error);
}
```

#### Initiating a payment

If a DApp needs to initiate a payment, `makeTransfer` is the right method to use. It takes an array of outputs that need to be present in final transaction. For more details consult [InitActions type documentation](type-aliases/InitActions.md).

```ts
import {nativeToken} from '@midnight-ntwrk/ledger'

try {
  const connected = await window.midnight.{selectedWalletId}.connect();
  const transaction = await connected.makeTransfer([{
    kind: 'unshielded',
    tokenType: nativeToken().raw,
    value: 10n**6n,
    recipient: 'mn_addr1abcdef.....'
  }]);
} catch (error) {
  console.log('an error occurred', error);
}
```

#### Balancing a transaction, for paying fees or interacting with contracts

To balance transaction, begin by creating a transaction in your DApp. You can [follow the guide on how to create a transaction here](docs/develop/guides/wallet-dev-guide.mdx#working-with-transactions). 
This method is particularly useful for DApps calling contracts, as this is the best way to use native tokens 
in a DApp or make the user pay the fees for a contract call. Depending on a use case and state of transaction 
to be balanced there are two methods available: `balanceSealedTransaction` and `balanceUnsealedTransaction`. 
They indicate different methods wallet will use to deserialize the transaction and try to balance it. 
A transaction being result of a contract call most likely will need a call to `balanceUnsealedTransaction` 
whereas completing a swap (e.g. initiated by `makeIntent` call) will require call to `balanceSealedTransaction`.

```ts
try {
  // assuming we have a transaction at hand here
  const transaction;

  const result = await connected.balanceUnsealedTransaction(transaction);
  const resultTransaction = result.tx;
} catch (error) {
  console.log('an error occurred', error);
}
```

#### Submitting a transaction

With the balanced and proven transaction from above, you can now submit it.

```ts
try {
  const submittedTransaction = await connected.submitTransaction(resultTransaction);
} catch (error) {
  console.log('an error occurred', error);
}
```


## Examples
In this section, you'll find examples demonstrating how to utilize the DApp connector API.

### Connect

```ts
import { NetworkId } from '@midnight-ntwrk/midnight-js-network-id';

declare function semverMatch(version, expectedRange);
declare function askUserToSelect(wallets: InitialAPI[]): Promise<InitialAPI>;


async function connect(): Promise<ConnectedAPI> {
  const networkId = NetworkId.MainNet;

  const compatibleWallets = Object.values(window.midnight ?? {})
    .filter((wallet) => semverMatch(wallet.apiVersion, '^1.0'));

  const selectedWallet = await askUserToSelect(compatibleWallets);
  const connectedWallet = await selectedWallet.connect(networkId);
  const connectionStatus = await connectedWallet.getConnectionStatus();
  assert(connectionstatus.networkId === networkId);
  return connectedWallet;
}
```

### Init a Night payment to an address

```ts
import { nativeToken } from '@midnight-ntwrk/ledger';

const connectedWallet = await connect();
const tx = await connectedWallet.makeTransfer([{
  kind: "unshielded",
  type: nativeToken().raw,
  value: 10_000_000, //10 Night
  recipient: "mn_addr1asujt0dayj4pelgq97wv75hjhscqv9epmzzpapkf8sy8c87jhh9s6e0fs3"
}]);
await connectedWallet.submitTransaction(tx);

```

### Init and complement a swap of night into a shielded token

```ts
// Party #1
import { nativeToken } from '@midnight-ntwrk/ledger';

declare function getFooTokenType(): TokenType;

const connectedWallet = await connect();
const shieldedAddress = (await connectedWallet.getShieldedAddresses()).shieldedAddress;
// This call will create a transaction with inputs and outputs structured so that there is:
// - surplus of 10 Night (inputs cover 10 Night, there might be some change output of Night created)
// - shortage of 50_000 Foo tokens (there is an output for 50_000 Foo tokens, but no inputs)
const tx = await connectedWallet.makeIntent([{
  kind: "unshielded",
  type: nativeToken().raw,
  value: 10_000_000, //10 Night
}], [{
  kind: "shielded",
  type: getFooTokenType(),
  value: 50_000,
  recipient: shieldedAddress
}]);
// Here, the `tx` can be submitted to some service, so that it becomes available to the other party


// Party #2
const tx = await fetchTransactionToMatch();
const connectedWallet = await connect();
// The the party #2 provides the 50_000 Foo tokens and creates self outputs for the surplus of 10 Night
const balancedTx = await connectedWallet.balanceSealedTransaction(tx);
await connectedWallet.submitTransaction(balancedTx);
```

### Delegate proving

```ts
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { Transaction } from '@midnight-ntwrk/ledger-v6';

const keyMaterialProvider = new FetchZkConfigProvider('https://example.com');

const connectedAPI = await connect();
const provingProvider = connectedAPI.getProvingProvider(keyMaterialProvider);

// Let's prepare the transaction and their inputs
const costModel = await fetchCostModel(); // E.g. from Indexer, using `Block.ledgerParameters`: https://github.com/midnightntwrk/midnight-indexer/blob/main/indexer-api/graphql/schema-v3.graphql#L36
const unprovedTx = prepareUnprovenTransaction(costModel); // E.g. make a contract call

// Now the proving itself:
const provenTx = await unprovenTx.prove(provingProvider, costModel);

// Now the transaction can be e.g. balanced (to pay fees) and submitted:
const finalTx = await connectedAPI.balancedUnsealedTransaction(provenTx);
await connectedAPI.submitTransaction(finalTx);
```

### LICENSE

Apache 2.0.

### README.md

Provides a brief description for users and developers who want to understand the purpose, setup, and usage of the repository.

### SECURITY.md

Provides a brief description of the Midnight Foundation's security policy and how to properly disclose security issues.

### CONTRIBUTING.md

Provides guidelines for how people can contribute to the Midnight project.

### CODEOWNERS

Defines repository ownership rules.

### ISSUE_TEMPLATE

Provides templates for reporting various types of issues, such as: bug report, documentation improvement and feature request.

### PULL_REQUEST_TEMPLATE

Provides a template for a pull request.

### CLA Assistant

The Midnight Foundation appreciates contributions, and like many other open source projects asks contributors to sign a contributor
License Agreement before accepting contributions. We use CLA assistant (https://github.com/cla-assistant/cla-assistant) to streamline the CLA
signing process, enabling contributors to sign our CLAs directly within a GitHub pull request.

### Dependabot

The Midnight Foundation uses GitHub Dependabot feature to keep our projects dependencies up-to-date and address potential security vulnerabilities.

### Checkmarx

The Midnight Foundation uses Checkmarx for application security (AppSec) to identify and fix security vulnerabilities.
All repositories are scanned with Checkmarx's suite of tools including: Static Application Security Testing (SAST), Infrastructure as Code (IaC), Software Composition Analysis (SCA), API Security, Container Security and Supply Chain Scans (SCS).

### Unito

Facilitates two-way data synchronization, automated workflows and streamline processes between: Jira, GitHub issues and Github project Kanban board.

