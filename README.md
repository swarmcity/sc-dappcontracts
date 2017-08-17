# Swarm City Dapp

## Index.sol

List of hashtags, their names, and their factory. Should not be deployed unless you want your own index.

## Parameters.sol

Manages blockchain-approved parameters for a DApp
Developers stake their reputation by deploying new keys to this contract.

## Hashtag.sol

Manages a hashtag
- Creates a MiniMe token contract for managing REP balances
- Registers Factories that can mint rep
- Manages hashtag commission fees

## DealForTwoFactory.sol

Manages a deal between 2 people within a certain hashtag.

# Developing

The truffle framework is used.
Contracts are in the contracts folder.

## Compiling contracts

```truffle compile```

## Running unit tests

```truffle test```

or

``` truffle test ./test/HashtagDeal.js ```
``` truffle test ./test/DealForTwo.js ```

## Deploying on the livenet

Open your parity client to sign transactions and then run these commands:

```
truffle exec scripts/deployhashtag.js --network live
->Fill in contract address in deploydealfortwofactory.js
truffle exec scripts/deploydealfortwofactory.js --network live
->fill in hashtag and contract address in registerdealfortwofactory.js
truffle exec scripts/registerdealfortwofactory.js --network live
```


