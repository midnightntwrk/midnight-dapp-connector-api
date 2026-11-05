[**@midnightntwrk/dapp-connector-api v4.1.0**](../README.md)

***

[@midnightntwrk/dapp-connector-api](../globals.md) / ErrorCodes

# Variable: ErrorCodes

> `const` **ErrorCodes**: `object`

All possible error codes gathered in a single object.

## Type Declaration

### Disconnected

> `readonly` **Disconnected**: `"Disconnected"` = `'Disconnected'`

The connection to the wallet was lost

### InsufficientFunds

> `readonly` **InsufficientFunds**: `"InsufficientFunds"` = `'InsufficientFunds'`

Wallet lacks sufficient balance to complete the requested transaction.
This is distinct from InvalidRequest - the request is well-formed but
cannot be fulfilled due to insufficient funds in the wallet.

### InternalError

> `readonly` **InternalError**: `"InternalError"` = `'InternalError'`

The dapp connector wasn't able to process the request

### InvalidRequest

> `readonly` **InvalidRequest**: `"InvalidRequest"` = `'InvalidRequest'`

Can be thrown in various circumstances, e.g. one being a malformed transaction

### PermissionRejected

> `readonly` **PermissionRejected**: `"PermissionRejected"` = `'PermissionRejected'`

Permission to perform action was rejected.

### Rejected

> `readonly` **Rejected**: `"Rejected"` = `'Rejected'`

The user rejected the request
