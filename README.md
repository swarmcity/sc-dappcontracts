![Swarm City](https://github.com/swarmcity/sc-boardwalk-production/blob/master/images/icons/icon-48x48.png?raw=true "Swarm City")


# Swarm City
### SwarmCityContracts


## Parameters.sol

Manages blockchain-approved parameters for a DApp
Developers stake their reputation by deploying new keys to this contract.

## HashtagSimpleDeal.sol

Manages a hashtag
- Creates a MiniMe token contract for managing REP balances
- Registers Factories that can mint rep
- Manages hashtag commission fees


# Developing

The truffle framework is used.
Contracts are in the contracts folder.

## Compiling contracts

```truffle compile```

## Running unit tests

```truffle test```

or

``` truffle test ./test/HashtagSimpleDeal-makedeal.js ```
``` truffle test ./test/HashtagSimpleDeal-conflictflow.js ```
``` truffle test ./test/HashtagSimpleDeal-conflictflow-provider.js ```
``` truffle test ./test/HashtagSimpleDeal-conflictflow-payout.js ```
``` truffle test ./test/HashtagSimpleDeal-cancelflow.js ```

<!-- ## Deploying on the livenet

Open your parity client to sign transactions and then run these commands:

```
truffle exec scripts/deployhashtag.js --network live
->Fill in contract address in deploydealfortwofactory.js
truffle exec scripts/deploydealfortwofactory.js --network live
->fill in hashtag and contract address in registerdealfortwofactory.js
truffle exec scripts/registerdealfortwofactory.js --network live
``` -->
