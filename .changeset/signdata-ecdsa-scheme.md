---
"@midnightntwrk/dapp-connector-api": minor
---

Add an optional `scheme` discriminator to the `signData` `Signature` type (`"ecdsa_secp256k1_sha256" | "schnorr_bip340"`) to support ECDSA signatures. The field is optional and defaults to `schnorr_bip340` when omitted, so the change is backward compatible; a future major version will make it mandatory. See [MIP-0003](https://github.com/midnightntwrk/midnight-improvement-proposals/blob/main/mips/mip-0003-ecdsa-support.md).
