---
"@midnightntwrk/dapp-connector-api": patch
---

Fix packaging: declaration files were emitted to `dist/src/*.d.ts`, leaking a `src` folder into the published tarball and breaking the `types` entry point (`./dist/index.d.ts` did not exist). Declarations now emit flat into `dist/`, and the `types` condition is listed first in `exports` so resolvers can actually reach it.
