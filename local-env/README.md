# Local Environment for Testing EEA Trusted Tokens
This is a self-contained environment based on docker and deployed with docker-compose, to test the end to end components that make up the EEA Trusted Tokens project.

## Architecture
![Deployment](/images/deployment-arch.png) 

## Setup and Launch

```
cd local-env
docker-compose pull
docker-compose up
```

The Ethereum RPC endpoints for the two Besu nodes are:
* http://localhost:22001
  * signing account: 0x7085d4d4c6efea785edfba5880bb62574e115626 (EEA Admin)
* http://localhost:23001
  * signing account: 0xb36b1934004385bfa5c51eaecb8ec348ec733ca8

## Deploying Token Contracts
Ten smart contracts need to work together to support the on-chain logic. To properly deploy them, use the logic in migrations/2_deploy_contracts.js

```
cd <project root>
truffle migrate --network devcon
```

You should see output like the following to indicate successful deployment:
```
Starting migrations...
======================
> Network name:    'devcon'
> Network id:      12345
> Block gas limit: 0x2fefd800

1_initial_migration.js
======================

...

2_deploy_contracts.js
=====================
   Deploying 'EthereumDIDRegistry'
   -------------------------------

   Deploying 'EthereumClaimsRegistry'
   ----------------------------------

   Deploying 'EEAClaimsIssuer'
   ---------------------------

   Deploying 'EEAOperator'
   -----------------------

   Deploying 'PenaltyToken'
   ------------------------

   Deploying 'ReputationToken'
   ---------------------------

   Deploying 'RewardToken'
   -----------------------

   Deploying 'WorkerRegistry'
   --------------------------

   Deploying 'WorkOrderRegistry'
   -----------------------------

Summary
=======
> Total deployments:   10
> Final cost:          0 ETH
```

## TODO
* prime the deployed contracts with data (registering claims and mint tokens)
* add front-end container to docker-compose
