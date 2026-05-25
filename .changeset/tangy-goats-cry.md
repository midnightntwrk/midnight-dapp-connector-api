---
'@midnightntwrk/dapp-connector-api': minor
---

Add the `InsufficientFunds` error code and improve consumer-side type resolution.

- **`ErrorCodes.InsufficientFunds`** — a new error code for requests that are well-formed but cannot be fulfilled because the wallet lacks the balance to complete the transaction, distinct from `InvalidRequest`. Documented in `SPECIFICATION.md`.
- **`./globals` export subpath** — the `globals` type augmentations are now exported at `@midnightntwrk/dapp-connector-api/globals`, so consumers can reference them explicitly (e.g. `/// <reference types="@midnightntwrk/dapp-connector-api/globals" />`). `globalThis.midnight` is now typed alongside the existing `Window.midnight` augmentation for Node/test environments.
- **NodeNext compatibility** — internal type imports now carry explicit `.js` extensions so consumers using `moduleResolution: "NodeNext"` can resolve this package's types instead of treating them as `any`.
