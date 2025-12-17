// This file is part of MIDNIGHT-DAPP-CONNECTOR-API.
// Copyright (C) 2025 Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Initial API for a wallet providing a DApp Connector API - it contains the information and methods allowing DApp to
 * chose and initiate a connection to the wallet.
 * Wallets inject their Initial API under the `window.midnight` object.
 * A single wallet can inject multiple instances of the Initial API, e.g. when supporting multiple versions.
 * Together with UUID under which the initial API is installed, the contents are compatible with the [draft of CAIP-372](https://github.com/ChainAgnostic/CAIPs/pull/372/files).
 */
export type InitialAPI = {
  /**
   * Wallet identifier, in a reverse DNS notation (e.g. `com.example.wallet`).
   * Wallets should keep this identifier stable throughout the lifecycle of the product.
   * DApps can use this property to identify the wallet, but should be prepared to handle
   * values that are unknown, invalid, or potentially misleading, similar to handling user agent strings in web browsers.
   */
  rdns: string;
  /**
   * Wallet name, expected to be displayed to the user.
   * As such, DApps need to sanitize the name to prevent XSS when displaying it to the user. An example
   * of sanitization is displaying the name using a text node.
   */
  name: string;
  /**
   * Wallet icon, as an URL, either reference to a hosted resource, or a base64 encoded data URL. It is expected
   * to be displayed to the user. Because of this, DApps need to display the icon in a secure fashion to prevent XSS.
   * For example, displaying the icon using an `img` tag.
   */
  icon: string;
  /**
   * Version of the API implemented by this instance of the API, string containing a version of the API package @midnight-ntwrk/dapp-connector-api that was used in implementation
   * E.g. wallet implementing version 3.1.5 provides apiVersion with value '3.1.5'
   * This value lets DApps to differentiate between different versions of the API and implement appropriate logic for each version or not use some versions at all
   */
  apiVersion: string;
  /**
   * Connect to wallet, hinting desired network id; Use 'mainnet' for mainnet.
   */
  connect: (networkId: string) => Promise<ConnectedAPI>;
};

/**
 * Connected API. It allows DApp to perform a range ofactions on the wallet after it is connected. Specifically the operations provided are:
 * - interaction with wallet - {@link WalletConnectedAPI} covers those
 * - hint usage of methods to the wallet (to help with permissions management)
 */
export type ConnectedAPI = WalletConnectedAPI & HintUsage;

/**
 * Wallet connected API. It is a subset of the Connected API defining all wallet-relevant methods.
 * Full Connected API also implements {@link HintUsage}. The operations provided cover all necessary
 * functionality for a DApp to interact with the wallet:
 * - getting balances and addresses
 * - submitting transactions
 * - creating and balancing transactions
 * - initializing intents (for swaps)
 * - signing data
 */
export type WalletConnectedAPI = {
  /**
   * Get the balances of shielded tokens of the wallet. They are represented as a record, whose keys are token types.
   */
  getShieldedBalances(): Promise<Record<TokenType, bigint>>;
  /**
   * Get the balances of unshielded tokens (potentially including Night) of the wallet. They are represented as a record, whose keys are token types.
   */
  getUnshieldedBalances(): Promise<Record<TokenType, bigint>>;
  /**
   * Get the balance of Dust of the wallet. It reports both:
   * - the current balance (which may change over time due to generation mechanics)
   * - the cap (the maximum amount of Dust that can be generated from the current Night balance).
   */
  getDustBalance(): Promise<{ cap: bigint; balance: bigint }>;
  /**
   * Get the shielded addresses of the wallet. For convenience it also returns the coin public key and encryption public key.
   * All of them are provided in Bech32m format.
   */
  getShieldedAddresses(): Promise<{
    shieldedAddress: string;
    shieldedCoinPublicKey: string;
    shieldedEncryptionPublicKey: string;
  }>;
  /**
   * Get the unshielded address of the wallet. It is provided in Bech32m format.
   */
  getUnshieldedAddress(): Promise<{
    unshieldedAddress: string;
  }>;
  /**
   * Get the Dust address of the wallet. It is provided in Bech32m format.
   */
  getDustAddress(): Promise<{ dustAddress: string }>;
  /**
   * Get the history of transactions of the wallet. Each history entry is a simplistic record of the fact that a transaction is relevant to the wallet.
   */
  getTxHistory(pageNumber: number, pageSize: number): Promise<HistoryEntry[]>;
  /**
   * Take unsealed transaction (with proofs, with no signatures and with preimage
   * data for cryptographic binding), pay fees, add necessary inputs and outputs
   * to remove imbalances from it, returning a transaction ready for submission
   *
   * This method is expected to be used by DApps when interacting with contracts - in many cases when contracts interact with native tokens, where wallet may need to add inputs and outputs to an existing intent to properly balance the transaction.
   *
   * In relation to Ledger API (`@midnight-ntwrk/ledger-v6`), this method expects a serialized transaction of type `Transaction<SignatureEnabled, Proof, PreBinding>`
   */
  balanceUnsealedTransaction(tx: string): Promise<{ tx: string }>;
  /**
   * Take sealed transaction (with proofs, signatures and cryptographically bound),
   * pay fees, add necessary inputs and outputs to remove imbalances from it,
   * returning a transaction ready for submission
   *
   * This method is mainly expected to be used by DApps when they operate on transactions created by the wallet or when the DApp wants to be sure that wallet performs balancing in a separate intent.
   * In such case, it is important to remember that some contracts might make use of fallible sections, in which case wallet won't be able to properly balance the transaction. In such cases, the DApp should use {@link balanceUnsealedTransaction} instead.
   *
   * In relation to Ledger API (`@midnight-ntwrk/ledger-v6`), this method expects a serialized transaction of type `Transaction<SignatureEnabled, Proof, Binding>`
   */
  balanceSealedTransaction(tx: string): Promise<{ tx: string }>;
  /**
   * Initialize a transfer transaction with desired outputs
   */
  makeTransfer(desiredOutputs: DesiredOutput[]): Promise<{ tx: string }>;
  /**
   * Initialize a transaction with unbalanced intent containing desired inputs and outputs.
   * Primary use-case for this method is to create a transaction, which inits a swap
   * Options:
   * `intentId` - what id use for created intent:
   *              use 1 to ensure no transaction merging will result in actions executed before created intent in the same transaction
   *              use specific number within ledger limitations to make the intent have that segment id assigned
   *              use "random" to allow wallet to pick one in random (e.g. when creating intent for swap purposes)
   * `payFees` - whether wallet should pay fees for the issued transaction or not
   */
  makeIntent(
    desiredInputs: DesiredInput[],
    desiredOutputs: DesiredOutput[],
    options: {
      intentId: number | 'random';
      payFees: boolean;
    },
  ): Promise<{ tx: string }>;
  /**
   * Sign provided data using key and format specified in the options, data to sign will be prepended with right prefix
   */
  signData(data: string, options: SignDataOptions): Promise<Signature>;
  /**
   * Submit a transaction to the network, effectively using wallet as a relayer.
   *
   * The transaction received is expected to be balanced and "sealed" - it means it contains proofs, signatures and cryptographically bound (`Transaction<SignatureEnabled, Proof, Binding>` type from `@midnight-ntwrk/ledger`)
   */
  submitTransaction(tx: string): Promise<void>;

  /**
   * Obtain the proving provider from the wallet to delegate proving to the wallet.
   *
   * @param keyMaterialProvider - object resolving prover and verifier keys, as well as the ZKIR representation of the circuit; `KeyMaterialProvider` is almost identical to the one in Midnight.js's `ZKConfigProvider` (https://github.com/midnightntwrk/midnight-js/blob/main/packages/types/src/zk-config-provider.ts#L25)
   *
   * @returns A `ProvingProvider` instance, compatible with Ledger's ProvingProvider (https://github.com/midnightntwrk/midnight-ledger/blob/main/ledger-wasm/ledger-v6.template.d.ts#L992)
   */
  getProvingProvider(keyMaterialProvider: KeyMaterialProvider): Promise<ProvingProvider>;

  /**
   * Get the configuration of the services used by the wallet.
   *
   * It is important for DApps to make use of those services whenever possible, as the wallet user might have some preferences in this regard, which e.g. improve privacy or performance.
   */
  getConfiguration(): Promise<Configuration>;
  /**
   * Status of an existing connection to wallet
   *
   * DApps can use this method to check if the connection is still valid.
   */
  getConnectionStatus(): Promise<ConnectionStatus>;
};

export type HintUsage = {
  /**
   * Hint usage of methods to the wallet.
   *
   * DApps should use this method to hint to the wallet what methods are expected to be used
   * in a certain context (be it whole session, single view, or a user flow - it is up to DApp).
   * The wallet can use these calls as an opportunity to ask user for permissions and in such case - resolve the promise only after the user has granted the permissions.
   */
  hintUsage(methodNames: Array<keyof WalletConnectedAPI>): Promise<void>;
};

export type Configuration = {
  /**  Indexer URI */
  indexerUri: string;
  /**  Indexer WebSocket URI */
  indexerWsUri: string;
  /**
   * Prover Server URI, likely to not be present, as different proving modalities emerge
   * @deprecated Use `getProvingProvider` instead
   */
  proverServerUri?: string | undefined;
  /**  Substrate URI */
  substrateNodeUri: string;

  /** Network id connected to - present here mostly for completness and to allow dapp validate it is connected to the network it wishes to */
  networkId: string;
};

/**
 * Execution status of a transaction.
 * It indicates which sections of a transaction were executed successfully or not.
 */
export type ExecutionStatus = Record<number, 'Success' | 'Failure'>;

export type TxStatus =
  | {
      /**
       * Transaction included in chain and finalized
       */
      status: 'finalized';
      executionStatus: ExecutionStatus;
    }
  | {
      /**
       * Transaction included in chain and not finalized yet
       */
      status: 'confirmed';
      executionStatus: ExecutionStatus;
    }
  | {
      /**
       * Transaction sent to network but is not known to be either confirmed or discarded yet
       */
      status: 'pending';
    }
  | {
      /**
       * Transaction failed to be included in chain, e.g. because of TTL or some validity checks
       */
      status: 'discarded';
    };

/**
 * Minimal information about a transaction relevant for the wallet.
 */
export type HistoryEntry = {
  /**
   * Hex-encoded hash of transaction
   */
  txHash: string;
  txStatus: TxStatus;
};

/**
 * Desired output from a transaction or intent. It specifies the type of the output, the amount and the recipient.
 * Recipient needs to be a properly formatted Bech32m address matching the kind of the token and network id the wallet is connected to.
 */
export type DesiredOutput = {
  kind: 'shielded' | 'unshielded';
  type: TokenType;
  value: bigint;
  recipient: string;
};

/**
 * Desired input from an intent. It specifies the type of the input and the amount to provide.
 */
export type DesiredInput = {
  kind: 'shielded' | 'unshielded';
  type: TokenType;
  value: bigint;
};

/**
 * Type of a token. It will be a hex-encoded string relating to ledger's raw token type.
 */
export type TokenType = string;

/**
 * Options for signing data. It specified which key to use for signing and how the data to sign is encoded.
 */
export type SignDataOptions = {
  /**
   * How are data for signing encoded.
   * "hex" and "base64" mean binary data are encoded using one or the other format,
   *   the wallet must decode them into binary sequence first
   * "text" means the data should be signed as provided in the string, but encoded into UTF-8 as a normalization step.
   *   Conversion is necessary, because JS strings are UTF-16
   */
  encoding: 'hex' | 'base64' | 'text';
  /**
   * What kind of key to use for signing
   */
  keyType: 'unshielded';
};

/**
 * Signature, accompanied by data signed and verifying key
 */
export type Signature = {
  /**
   * The data signed
   */
  data: string;
  signature: string;
  verifyingKey: string;
};

/**
 * Status of an existing connection to wallet
 * It either indicates that the connection is established to a specific network id, or that the connection is lost
 */
export type ConnectionStatus =
  | {
      /**
       * Connection is established to following network id
       */
      status: 'connected';
      networkId: string;
    }
  | {
      /**
       * Connection is lost
       */
      status: 'disconnected';
    };

/**
 * Object resolving prover and verifier keys, as well as the ZKIR representation of the circuit.
 * It is almost identical to the one in Midnight.js's `ZKConfigProvider` (https://github.com/midnightntwrk/midnight-js/blob/main/packages/types/src/zk-config-provider.ts#L25)
 *
 * It has separate methods for getting the ZKIR, prover key and verifier key to allow for caching of the keys and to avoid loading the prover key into memory when it is not needed.
 */
export type KeyMaterialProvider = {
  getZKIR(circuitKeyLocation: string): Promise<Uint8Array>;
  getProverKey(circuitKeyLocation: string): Promise<Uint8Array>;
  getVerifierKey(circuitKeyLocation: string): Promise<Uint8Array>;
};

/**
 * Object abstracting the proving functionality
 * It is compatible with Ledger's ProvingProvider (https://github.com/midnightntwrk/midnight-ledger/blob/main/ledger-wasm/ledger-v6.template.d.ts#L992)
 */
export type ProvingProvider = {
  check(serializedPreimage: Uint8Array, keyLocation: string): Promise<(bigint | undefined)[]>;
  prove(
    serializedPreimage: Uint8Array,
    keyLocation: string,
    overwriteBindingInput?: bigint,
  ): Promise<Uint8Array>;
};
