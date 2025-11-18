[**@midnight-ntwrk/dapp-connector-api v4.0.0-beta.1**](../README.md)

***

[@midnight-ntwrk/dapp-connector-api](../globals.md) / ConnectionStatus

# Type Alias: ConnectionStatus

> **ConnectionStatus**: \{ `networkId`: `string` \| `NetworkId`; `status`: `"connected"`; \} \| \{ `status`: `"disconnected"`; \}

Status of an existing connection to wallet
It either indicates that the connection is established to a specific network id, or that the connection is lost

## Type declaration

\{ `networkId`: `string` \| `NetworkId`; `status`: `"connected"`; \}

### networkId

> **networkId**: `string` \| `NetworkId`

### status

> **status**: `"connected"`

Connection is established to following network id

\{ `status`: `"disconnected"`; \}

### status

> **status**: `"disconnected"`

Connection is lost
