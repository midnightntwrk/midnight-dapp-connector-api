# Changelog

## 4.1.0-beta.2

### Minor Changes

- 3bed777: Add the `InsufficientFunds` error code and improve consumer-side type resolution.
  - **`ErrorCodes.InsufficientFunds`** — a new error code for requests that are well-formed but
    cannot be fulfilled because the wallet lacks the balance to complete the transaction, distinct
    from `InvalidRequest`. Documented in `SPECIFICATION.md`.
  - **`./globals` export subpath** — the `globals` type augmentations are now exported at
    `@midnightntwrk/dapp-connector-api/globals`, so consumers can reference them explicitly (e.g.
    `/// <reference types="@midnightntwrk/dapp-connector-api/globals" />`). `globalThis.midnight` is
    now typed alongside the existing `Window.midnight` augmentation for Node/test environments.
  - **NodeNext compatibility** — internal type imports now carry explicit `.js` extensions so
    consumers using `moduleResolution: "NodeNext"` can resolve this package's types instead of
    treating them as `any`.

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
