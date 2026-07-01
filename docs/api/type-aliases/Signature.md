[**@midnight-ntwrk/dapp-connector-api v4.1.0**](../README.md)

***

[@midnight-ntwrk/dapp-connector-api](../globals.md) / Signature

# Type Alias: Signature

> **Signature** = `object`

Signature, accompanied by data signed and verifying key

## Properties

### data

> **data**: `string`

The data signed

***

### scheme?

> `optional` **scheme**: `"ecdsa_secp256k1_sha256"` \| `"schnorr_bip340"`

The signature scheme used to produce the signature.

This field is optional for backward compatibility: when it is omitted, the signature must be
interpreted as being produced with the `schnorr_bip340` scheme, which is the default. A future
major version of the API will make this field mandatory.

DApps relying on `signData` should be aware of both signature schemes and handle the
discriminator accordingly.

***

### signature

> **signature**: `string`

The signature, encoded as the concatenation of the big-endian byte encodings of the scalars
`r` and `s`, each padded to 32 bytes (64 bytes total, for either scheme).

***

### verifyingKey

> **verifyingKey**: `string`

The verifying (public) key. Its format depends on the `scheme`:
- 32 bytes for `schnorr_bip340` (BIP-340 x-only)
- 33 bytes for `ecdsa_secp256k1_sha256` (SEC1 compressed)
