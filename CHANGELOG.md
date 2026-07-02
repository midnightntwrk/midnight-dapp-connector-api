# Changelog

## 4.1.0-beta.1

### Patch Changes

- 5331b44: Fix packaging: declaration files were emitted to `dist/src/*.d.ts`, leaking a `src`
  folder into the published tarball and breaking the `types` entry point (`./dist/index.d.ts` did
  not exist). Declarations now emit flat into `dist/`, and the `types` condition is listed first in
  `exports` so resolvers can actually reach it.

## 4.1.0-beta.0

### Minor Changes

- 547a0e4: Publish under the new `@midnightntwrk` npm scope on npmjs.org, with the legacy
  `@midnight-ntwrk` scope mirrored as a transitional alias, and adopt Changesets-driven versioning
  and releases.
- 65b4ee2: Add an optional `scheme` discriminator to the `signData` `Signature` type
  (`"ecdsa_secp256k1_sha256" | "schnorr_bip340"`) to support ECDSA signatures. The field is optional
  and defaults to `schnorr_bip340` when omitted, so the change is backward compatible; a future
  major version will make it mandatory. See
  [MIP-0003](https://github.com/midnightntwrk/midnight-improvement-proposals/blob/main/mips/mip-0003-ecdsa-support.md).

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
