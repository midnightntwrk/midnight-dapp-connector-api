[**@midnight-ntwrk/dapp-connector-api v4.0.0-beta.1**](../README.md)

***

[@midnight-ntwrk/dapp-connector-api](../globals.md) / WalletConnectedAPI

# Type Alias: WalletConnectedAPI

> **WalletConnectedAPI**: `object`

Wallet connected API. It is a subset of the Connected API defining all wallet-relevant methods.
Full Connected API also implements [HintUsage](HintUsage.md). The operations provided cover all necessary
functionality for a DApp to interact with the wallet:
- getting balances and addresses
- submitting transactions
- creating and balancing transactions
- initializing intents (for swaps)
- signing data

## Type declaration

### balanceSealedTransaction()

Take sealed transaction (with proofs, signatures and cryptographically bound),
pay fees, add necessary inputs and outputs to remove imbalances from it,
returning a transaction ready for submission

This method is mainly expected to be used by DApps when they operate on transactions created by the wallet or when the DApp wants to be sure that wallet performs balancing in a separate intent.
In such case, it is important to remember that some contracts might make use of fallible sections, in which case wallet won't be able to properly balance the transaction. In such cases, the DApp should use [balanceUnsealedTransaction](WalletConnectedAPI.md#balanceunsealedtransaction) instead.

In relation to Ledger API (`@midnight-ntwrk/ledger`), this method expects a serialized transaction of type `Transaction<SignatureEnabled, Proof, Binding>`

#### Parameters

##### tx

`string`

#### Returns

`Promise`\<\{ `tx`: `string`; \}\>

### balanceUnsealedTransaction()

Take unsealed transaction (with proofs, with no signatures and with preimage
data for cryptographic binding), pay fees, add necessary inputs and outputs
to remove imbalances from it, returning a transaction ready for submission

This method is expected to be used by DApps when interacting with contracts - in many cases when contracts interact with native tokens, where wallet may need to add inputs and outputs to an existing intent to properly balance the transaction.

In relation to Ledger API (`@midnight-ntwrk/ledger`), this method expects a serialized transaction of type `Transaction<SignatureErased, Proof, PreBinding>`

#### Parameters

##### tx

`string`

#### Returns

`Promise`\<\{ `tx`: `string`; \}\>

### getConfiguration()

Get the configuration of the services used by the wallet.

It is important for DApps to make use of those services whenever possible, as the wallet user might have some preferences in this regard, which e.g. improve privacy or performance.

#### Returns

`Promise`\<[`Configuration`](Configuration.md)\>

### getConnectionStatus()

Status of an existing connection to wallet

DApps can use this method to check if the connection is still valid.

#### Returns

`Promise`\<[`ConnectionStatus`](ConnectionStatus.md)\>

### getDustAddress()

Get the Dust address of the wallet. It is provided in Bech32m format.

#### Returns

`Promise`\<\{ `dustAddress`: `string`; \}\>

### getDustBalance()

Get the balance of Dust of the wallet. It reports both:
- the current balance (which may change over time due to generation mechanics)
- the cap (the maximum amount of Dust that can be generated from the current Night balance).

#### Returns

`Promise`\<\{ `balance`: `bigint`; `cap`: `bigint`; \}\>

### getShieldedAddresses()

Get the shielded addresses of the wallet. For convenience it also returns the coin public key and encryption public key.
All of them are provided in Bech32m format.

#### Returns

`Promise`\<\{ `shieldedAddress`: `string`; `shieldedCoinPublicKey`: `string`; `shieldedEncryptionPublicKey`: `string`; \}\>

### getShieldedBalances()

Get the balances of shielded tokens of the wallet. They are represented as a record, whose keys are token types.

#### Returns

`Promise`\<`Record`\<`string`, `bigint`\>\>

### getTxHistory()

Get the history of transactions of the wallet. Each history entry is a simplistic record of the fact that a transaction is relevant to the wallet.

#### Parameters

##### pageNumber

`number`

##### pageSize

`number`

#### Returns

`Promise`\<[`HistoryEntry`](HistoryEntry.md)[]\>

### getUnshieldedAddress()

Get the unshielded address of the wallet. It is provided in Bech32m format.

#### Returns

`Promise`\<\{ `unshieldedAddress`: `string`; \}\>

### getUnshieldedBalances()

Get the balances of unshielded tokens (potentially including Night) of the wallet. They are represented as a record, whose keys are token types.

#### Returns

`Promise`\<`Record`\<`string`, `bigint`\>\>

### makeIntent()

Initialize a transaction with unbalanced intent containing desired inputs and outputs.
Primary use-case for this method is to create a transaction, which inits a swap
Options:
`intentId` - what id use for created intent:
             use 1 to ensure no transaction merging will result in actions executed before created intent in the same transaction
             use specific number within ledger limitations to make the intent have that segment id assigned
             use "random" to allow wallet to pick one in random (e.g. when creating intent for swap purposes)
`payFees` - whether wallet should pay fees for the issued transaction or not

#### Parameters

##### desiredInputs

[`DesiredInput`](DesiredInput.md)[]

##### desiredOutputs

[`DesiredOutput`](DesiredOutput.md)[]

##### options

###### intentId

`number` \| `"random"`

###### payFees

`boolean`

#### Returns

`Promise`\<\{ `tx`: `string`; \}\>

### makeTransfer()

Initialize a transfer transaction with desired outputs

#### Parameters

##### desiredOutputs

[`DesiredOutput`](DesiredOutput.md)[]

#### Returns

`Promise`\<\{ `tx`: `string`; \}\>

### signData()

Sign provided data using key and format specified in the options, data to sign will be prepended with right prefix

#### Parameters

##### data

`string`

##### options

[`SignDataOptions`](SignDataOptions.md)

#### Returns

`Promise`\<[`Signature`](Signature.md)\>

### submitTransaction()

Submit a transaction to the network, effectively using wallet as a relayer.

The transaction received is expected to be balanced and "sealed" - it means it contains proofs, signatures and cryptographically bound (`Transaction<SignatureEnabled, Proof, Binding>` type from `@midnight-ntwrk/ledger`)

#### Parameters

##### tx

`string`

#### Returns

`Promise`\<`void`\>
