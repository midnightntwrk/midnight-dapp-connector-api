# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.1.0]

### Added

- `signData` ECDSA support: the `Signature` type now carries an optional `scheme` discriminator
  (`"ecdsa_secp256k1_sha256" | "schnorr_bip340"`) identifying the signature scheme used. The field is
  optional and defaults to `schnorr_bip340` when omitted, keeping the change backward compatible; a
  future major version will make it mandatory. See [MIP-0003](https://github.com/midnightntwrk/midnight-improvement-proposals/blob/main/mips/mip-0003-ecdsa-support.md).
