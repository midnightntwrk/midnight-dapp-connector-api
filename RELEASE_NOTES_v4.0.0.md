# Release Notes

### Version 4.0.0

**Version:** 4.0.0 **Date:** 2026-01-28 **Environment:** preview, preprod

### High-level summary

This release represents a complete redesign of the DApp Connector API, introducing a type-based
architecture, network-aware connections, granular balance/address methods, proving delegation, and
CAIP-372 compatible wallet discovery. Breaking changes affect all developers using v3.0.0.

### Audience

This release note is critical for developers who:

- Use `@midnight-ntwrk/dapp-connector-api` in their DApps
- Integrate wallet functionality into Midnight applications
- Maintain wallet implementations compatible with the DApp Connector API

### What changed (Summary of updates)

- Complete API redesign from interface-based to type-based architecture
- Replaced `enable()`/`isEnabled()` connection model with network-aware `connect(networkId)`
- Removed dependencies on `@midnight-ntwrk/wallet-api` and `@midnight-ntwrk/zswap`
- Added proving delegation via `getProvingProvider()` method
- Added atomic swap support via `makeIntent()` method
- Added granular balance and address methods replacing single `state()` method
- Added new error codes: `PermissionRejected` and `Disconnected`
- Changed `APIError` from class to type for cross-boundary compatibility
- Added comprehensive specification documentation

### New features

**Proving Delegation (`getProvingProvider`)**

**Description:** Allows DApps to delegate ZK proof generation to the wallet. This enables wallets to
offer different proving modalities (local, remote, hardware-accelerated) based on user preferences,
improving flexibility and user experience. DApps provide a `KeyMaterialProvider` and receive a
`ProvingProvider` compatible with Midnight Ledger's interface.

**Intent Creation (`makeIntent`)**

**Description:** Creates transactions with purposefully imbalanced intents for atomic swap
scenarios. Allows specifying desired inputs and outputs with configurable intent IDs and fee payment
options. Essential for DEX integrations and peer-to-peer token swaps.

**Transfer Creation (`makeTransfer`)**

**Description:** Simplified method for creating transfer transactions with specified outputs.
Handles all complexity of coin selection and transaction construction internally.

**Data Signing (`signData`)**

**Description:** Enables signing arbitrary data using wallet keys with configurable encoding (hex,
base64, text) and key type selection. Data is automatically prefixed to prevent accidental
transaction signing.

**Transaction History (`getTxHistory`)**

**Description:** Retrieves paginated transaction history relevant to the wallet, including
transaction hashes and detailed status information (pending, confirmed, finalized, discarded).

**Connection Status (`getConnectionStatus`)**

**Description:** Allows DApps to check if a wallet connection is still valid and which network it's
connected to.

**Hint Usage (`hintUsage`)**

**Description:** Enables DApps to hint which API methods they intend to use, allowing wallets to
proactively request user permissions for better UX.

**CAIP-372 Compatible Discovery**

**Description:** New `InitialAPI` type includes `rdns` (reverse DNS identifier), `name`, `icon`, and
`apiVersion` for standardized wallet discovery compatible with the CAIP-372 draft specification.

### New features requiring configuration updates

**Network-aware Connection**

**Required Updates:**

- Replace `wallet.enable()` with `wallet.connect(networkId)`
- Use 'mainnet' for mainnet, other strings for test networks

**Impact:** All DApps must update their connection logic to specify the target network. This ensures
DApps connect to the correct network and enables multi-network wallet support.

### Improvements

**Granular Balance Methods**

**Description:** Replaced single `state()` method with specific methods (`getShieldedBalances`,
`getUnshieldedBalances`, `getDustBalance`) providing clearer semantics and enabling finer-grained
permission control.

**Granular Address Methods**

**Description:** Separate methods for retrieving different address types (`getShieldedAddresses`,
`getUnshieldedAddress`, `getDustAddress`) with Bech32m encoding.

**Type-based Architecture**

**Description:** Moved from interface/class-based design to TypeScript types, eliminating
cross-boundary `instanceof` issues and reducing bundle size by removing the `ts-custom-error`
dependency.

**Enhanced Transaction Balancing**

**Description:** Split transaction balancing into `balanceUnsealedTransaction` and
`balanceSealedTransaction` providing appropriate methods for different use cases.

### Deprecations

**Prover Server URI**

**Starts:** v4.0.0 **Full Removal:** v5.0.0 (planned) **Replacement:** `getProvingProvider()` method
**Migration Steps:**

- Stop using `proverServerUri` from configuration
- Use `getProvingProvider(keyMaterialProvider)` to obtain a proving provider
- Integrate with Midnight.js's `ZKConfigProvider` for key material resolution

### Breaking changes or required actions for developers

**Breaking Change:** Complete API Redesign

**What changed:** The entire API structure has been redesigned from interface-based to type-based
architecture. **What breaks:** All existing DApp integrations using v3.0.0 API. **Required
actions:**

- Update all imports to use new type names
- Replace `DAppConnectorAPI` with `InitialAPI`
- Replace `DAppConnectorWalletAPI` with `WalletConnectedAPI`
- Replace `DAppConnectorWalletState` usage with individual method calls

**Code Example:**

```typescript
// v3.0.0
const wallet: DAppConnectorAPI = window.midnight?.someWallet;
const enabled = await wallet.isEnabled();
const walletApi = await wallet.enable();
const state = await walletApi.state();
console.log(state.address);

// v4.0.0
const wallet: InitialAPI = window.midnight?.someWallet;
const connectedApi = await wallet.connect('preview');
const addresses = await connectedApi.getShieldedAddresses();
console.log(addresses.shieldedAddress);
```

---

**Breaking Change:** Connection Model

**What changed:** Removed `enable()` and `isEnabled()` methods, replaced with `connect(networkId)`.
**What breaks:** All connection logic in existing DApps. **Required actions:**

- Replace `wallet.enable()` with `wallet.connect(networkId)`
- Remove `isEnabled()` checks; use `getConnectionStatus()` instead
- Provide network ID parameter (use 'mainnet' for mainnet)

---

**Breaking Change:** State Access Removal

**What changed:** Removed `state()` method returning combined wallet state. **What breaks:** Any
code accessing `state().address`, `state().coinPublicKey`, etc. **Required actions:**

- Replace `state()` with appropriate granular methods
- Use `getShieldedAddresses()` for shielded address and keys
- Use `getUnshieldedAddress()` for unshielded address
- Use `getShieldedBalances()` / `getUnshieldedBalances()` for balances

**Code Example:**

```typescript
// v3.0.0
const state = await walletApi.state();
const address = state.address;
const coinPubKey = state.coinPublicKey;

// v4.0.0
const { shieldedAddress, shieldedCoinPublicKey } = await connectedApi.getShieldedAddresses();
```

---

**Breaking Change:** Transaction Balancing

**What changed:** Replaced `balanceAndProveTransaction(tx, newCoins)` with
`balanceUnsealedTransaction(tx)` and `balanceSealedTransaction(tx)`. **What breaks:** All
transaction balancing logic. **Required actions:**

- Determine if your use case needs unsealed (contract interactions) or sealed (swap completion)
  balancing
- Update method calls and handle string-based transaction format
- Remove `newCoins` parameter (no longer needed)

**Code Example:**

```typescript
// v3.0.0
const provedTx = await walletApi.balanceAndProveTransaction(tx, newCoins);

// v4.0.0
const { tx: balancedTx } = await connectedApi.balanceUnsealedTransaction(serializedTx);
```

---

**Breaking Change:** APIError Type

**What changed:** `APIError` changed from a class extending `CustomError` to a type alias. **What
breaks:** `instanceof APIError` checks. **Required actions:**

- Replace `error instanceof APIError` with `error.type === 'DAppConnectorAPIError'`
- Update error handling logic

**Code Example:**

```typescript
// v3.0.0
try {
  await walletApi.submitTransaction(tx);
} catch (error) {
  if (error instanceof APIError) {
    console.log(error.code);
  }
}

// v4.0.0
try {
  await connectedApi.submitTransaction(tx);
} catch (error) {
  if (error.type === 'DAppConnectorAPIError') {
    console.log(error.code);
  }
}
```

---

**Breaking Change:** Configuration Interface

**What changed:** `ServiceUriConfig` renamed to `Configuration`, added `networkId`, made
`proverServerUri` optional and deprecated. **What breaks:** Code importing or using
`ServiceUriConfig`. **Required actions:**

- Update imports to use `Configuration` type
- Handle optional `proverServerUri`
- Validate `networkId` matches expected network

---

**Breaking Change:** Removed Dependencies

**What changed:** Removed `@midnight-ntwrk/wallet-api` and `@midnight-ntwrk/zswap` as dependencies.
**What breaks:** Type imports that relied on these transitive dependencies. **Required actions:**

- Update transaction types to use string serialization format

### Links and references

- PRs: https://github.com/midnightntwrk/dapp-connector-api/pulls
- Specification: [SPECIFICATION.md](./SPECIFICATION.md)
- API Documentation: [docs/api/README.md](./docs/api/README.md)
- NPM Package: https://www.npmjs.com/package/@midnight-ntwrk/dapp-connector-api |
