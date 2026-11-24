# A reference permission model for wallets

## Introduction

A user opens an exchange in one tab and a game in another, and connects the same wallet to both. The
exchange shows the user's unshielded balances. The game needs only a signature at login. Can the
game also read what the user holds in shielded tokens, or keep the user's prover busy? The connector
API leaves such questions to the wallet and documents no model for answering them. So each wallet
decides on its own what a connected DApp may see and do, and a DApp cannot tell before it calls
which of its calls will succeed.

This document describes one way to answer: ask the user the first time a DApp tries to do something,
the way a phone asks the first time an app wants the camera.

To keep the prompts few and meaningful, the wallet groups the API's methods into a handful of
capabilities. The grouping follows what calls reveal about the user, what they commit on the user's
behalf, or which of the user's resources they use. Allowing a DApp to use a capability does not
approve anything it then asks for: the user still approves each transaction and signature. From the
wallet, the user can take back any answer, disconnect a site or block it.

The model is not normative. The [specification](../SPECIFICATION.md#permissions) leaves permissions
to the wallet, and nothing here changes the API or what a wallet must do. Wallet builders can adopt
the model, or depart from it knowing what they give up. DApp developers learn what a wallet that
follows it will do, and how to write a DApp that behaves well under it.

## Asking on first use

The user decides best with the request in front of them: which site asks, for what, at the moment it
needs it. Scopes asked up front come before the user knows what the DApp will do, so the user can
only guess, and a prompt that asks for everything at once teaches users to accept everything. A DApp
that never uses a capability is never asked about it.

`connect` asks whether the site may connect, and on which network; it asks for no data. A DApp that
knows what a flow will need calls `hintUsage` before the flow starts. The wallet then asks about
every undecided capability among the hinted methods in one prompt, at a moment the DApp chose.
Without a hint, the wallet asks at the first call to a method whose capability is undecided, and
that call waits for the answer. `hintUsage` resolves when any prompt it raised has closed, whatever
the outcome; the DApp learns what was decided from its next calls.

## Capabilities

The user answers for a capability, and each capability covers one or more methods. The model keeps
reading unshielded data apart from reading shielded data, and merges methods only where a separate
prompt would protect nothing the user can weigh. A wallet may split any group further, down to one
capability per method.

| Capability         | Methods                                                                                | A grant reveals or allows                                                 |
| ------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Unshielded view    | `getUnshieldedAddress`, `getUnshieldedBalances`                                        | the unshielded address and its balances                                   |
| Shielded addresses | `getShieldedAddresses`                                                                 | the shielded addresses, enough to pay the user                            |
| Shielded balances  | `getShieldedBalances`                                                                  | the shielded balances                                                     |
| Dust view          | `getDustAddress`, `getDustBalance`                                                     | the Dust address, its cap and its current balance                         |
| History            | `getTxHistory`                                                                         | which transactions on chain are the wallet's                              |
| Transacting        | `makeTransfer`, `makeIntent`, `balanceUnsealedTransaction`, `balanceSealedTransaction` | asking the user to approve transactions                                   |
| Signing            | `signData`                                                                             | asking the user to approve signatures                                     |
| Proving            | `getProvingProvider`                                                                   | use of the user's prover and its compute                                  |
| Not gated          | `getConfiguration`, `getConnectionStatus`, `hintUsage`, `submitTransaction`            | nothing about the user's funds or history, and nothing of theirs to spend |

Signatures are in [`src/api.ts`](../src/api.ts); what each error means is in the
[specification](../SPECIFICATION.md#errors) and [`src/errors.ts`](../src/errors.ts).

Anyone who knows an unshielded address can read its balances from the chain, so the balances need no
prompt of their own. A shielded address lets a DApp pay the user without learning what the user
holds, so it has its own prompt, apart from the shielded balances.

Dust view stays its own capability. The ledger publishes each Dust address with its cap and the
registration that links it to Night addresses
([ledger specification, Dust](https://github.com/midnightntwrk/midnight-ledger/blob/main/spec/dust.md)).
It does not publish the current Dust balance, which reflects the fees the user has paid. Merging
Dust view into Unshielded view would hand out a private figure under a prompt about public data.

History is its own capability: transaction hashes tie the wallet to specific transactions, shielded
ones included, which a site allowed to see addresses and balances has not learned.

Transacting and Signing are split because a signature can stand for the user off the chain, such as
at a login.

Proving reveals nothing about the user, but it spends what is theirs: `getProvingProvider` lets the
DApp prove data it supplies on the user's prover, with the user's compute. Proving needs no approval
of each request, so the grant is the only time the user is asked. Proving stays apart from
Transacting because a DApp can need proofs without asking the user to commit anything. The grant
also covers the provider's `check` and `prove` calls, which fail as other calls to the capability do
once the user takes it back, disconnects or blocks the site.

## What an answer means

- **Allow for this session.** The DApp's calls to the capability succeed until the page session or
  the connection ends, whichever comes first.
- **Allow until revoked.** The calls succeed until the user takes the grant back in the wallet.
- **Refuse.** The call fails with `PermissionRejected`, and so does every later call to the
  capability for the rest of the page session.
- **Dismiss**, or let the prompt lapse. The user has decided nothing. The call fails with
  `Rejected`, and a later call may ask again.

The page session lasts until the tab closes, as in the specification. The connection ends at a
disconnect, or when the wallet drops it on its own, such as when it locks. So after any
`Disconnected`, a DApp that reconnects is asked again for each capability it held only for the
session. Whether a refusal outlasts the page session is the wallet's choice. With several tabs open
on one origin, each tab keeps a refusal it has seen until that tab closes.

An answer covers the calling frame's origin, which the prompt shows, and the network the DApp
connected to. A grant on a test network does not carry to mainnet, and a grant to a page does not
carry to a frame from another origin it embeds.

## Allowing is not approving

A grant lets a DApp ask; it never approves. By default, each request to build, balance or sign shows
the user what it commits, and the user approves or rejects that request alone. A rejection reaches
the DApp as `Rejected`, and the grant stands. Two calls need no approval of their own:
`submitTransaction` only relays a transaction the user already approved, and proving commits the
user to nothing.

A wallet may let the user set an auto-approval policy, such as a cap under which small transfers go
through without review. That policy is the user's standing approval, not part of any grant, and no
DApp can obtain or change it.

## Revocation, disconnecting and blocking

From the wallet's UI the user can take back a decision, disconnect a site or block it. The API has
no `disconnect` method for a DApp to call; adding one is an API change with its own Midnight
Improvement Proposal.

When the user takes back a grant, later calls to that capability fail with `PermissionRejected` for
the rest of the page session. Taking back a refusal takes effect only from the next page session,
because the specification lets a DApp that has seen `PermissionRejected` expect to keep seeing it
until the tab closes. In both cases, the capability becomes undecided at the next page session, and
the DApp's first call to it asks again. The API does not notify the DApp when the user takes back a
grant or a refusal.

Disconnecting ends the connection. `getConnectionStatus` reports the connection as disconnected,
other calls fail with `Disconnected`, and a later `connect` may succeed. The user chooses whether
the wallet keeps or forgets the site's decisions. Keeping them suits troubleshooting, such as
reconnecting a site that misbehaves, with its grants intact; forgetting them suits widening access,
such as granting a capability the user once refused. After a later `connect`, a site whose decisions
were forgotten is asked again for what it held, and, from the next page session, for what it was
refused.

Blocking is for a site the user wants to stop hearing from. It ends any open connection the same
way. In a page already open, `connect` fails with `PermissionRejected` without a prompt. On the
site's later page loads, the wallet may answer the same way or not expose itself to the site at all.
Unblocking takes effect from the next page session, as taking back a refusal does.

## Guidance for DApp developers

- Call `hintUsage` before a flow, and explain the flow first, so the user is asked once and knows
  why.
- Call only what the current feature needs: each capability is a prompt. Treat each
  `PermissionRejected` as the wallet's current answer. Degrade the feature instead of calling again,
  and do not store the refusal for the next visit.
- After `Rejected`, offer to try again only when the user acts, and stop offering after a few tries,
  since the wallet may have stopped asking for this page session.
- After `Disconnected`, reconnect at most once, and only on the user's next action, since the user
  may have just disconnected the site.

## Security considerations

**Identity shown to the user.** Every decision rests on the origin in the prompt, which appears in
the wallet's own window, where the page cannot draw over it or script it. A name or icon the page
supplies may appear only marked as unverified. A lookalike domain remains possible, and the model
cannot stop a user granting to one. A grant kept until revoked passes to whoever controls the origin
later, after a compromise or a change of domain owner.

**Prompt flooding.** A DApp can call repeatedly to wear the user into a grant. A wallet following
this model shows one prompt at a time per origin, holds refusals, and after repeated dismissals
stops asking for the page session and answers `Rejected`. A block covers every tab of the origin. A
site can still escape all of this by using other origins, and a `hintUsage` naming every method
rebuilds the ask-everything prompt the model rejects.

A site holding Transacting or Signing can still repeat approval requests, one prompt at a time, and
one holding Proving can keep the user's prover busy. The model does not stop this; the user can take
back the grant or block the site.

**Linkage across sites, accounts and networks.** Every address a site sees is a stable identifier,
and two sites shown the same address can link the user. A Dust view grant can link the user as
surely as an Unshielded view grant, because the ledger publicly links the Dust address to the user's
Night addresses, which are their unshielded addresses. The Dust view prompt says so.

Grants keyed only by origin let a site link the accounts a user switches between. Any connected site
can read the wallet's node, indexer and prover URLs with `getConfiguration`, and URLs the user chose
can identify the user across sites. Grants are bound to a network, but a wallet that uses the same
keys on every network shows a test-network site the user's mainnet addresses.

**What a DApp learns without a view grant.** A refusal the user just gave and one the wallet applied
from a stored decision both arrive as `PermissionRejected`, and only the delay tells them apart.
Whether the wallet asks depends only on what was decided, never on what the user holds, so the delay
reveals a decision and not the holdings. A wallet that refused without a prompt whenever the
shielded balance was zero would give that zero away to any site that times its calls.

Three leaks remain. `InsufficientFunds` tells a site with the Transacting grant that a balance is
below an amount, so repeated requests can bound a balance it was never shown. Which requests pass
without review reveals a user's auto-approval cap. A signature, or an approved transaction spending
unshielded funds, hands the site the verifying key that checks the signature. The unshielded address
is a hash of that key, so the site learns the address and its balances, though Unshielded view was
refused.

## Alternatives considered

- **Scopes asked up front**: the user decides before seeing what the DApp does, for the reasons in
  [Asking on first use](#asking-on-first-use).
- **A prompt per method by default**: more prompts, including one for the balance of an address the
  chain already publishes.
- **Auto-approval by default**: a granted DApp could move funds with no review.
- **Requiring a user gesture**: the DApp controls the page, so any click it elicits qualifies. A
  gesture shows the user clicked, not that they meant this request.
