# Local Environment for Testing EEA Trusted Tokens
This is a self-contained environment based on docker and deployed with docker-compose, to test the end to end components that make up the EEA Trusted Tokens project.

## Architecture
![Deployment](/images/deployment-arch.png) 

## Setup and Launch

```
cd local-env
docker-compose pull
docker-compose up -d
```

The Ethereum RPC endpoints for the two Besu nodes are:
* http://localhost:22001
  * signing account: 0x7085d4d4c6efea785edfba5880bb62574e115626 (EEA Admin)
* http://localhost:23001
  * signing account: 0xb36b1934004385bfa5c51eaecb8ec348ec733ca8 (Org1 Admin)
* http://localhost:24001
  * signing account: 0xa8d1ddc96a08b44020b1eca4c4b63ab55d7fdb69 (Org1 employee 1)

## Procedure to fully initiate the blockchain network
The following steps are taken to prime the blockchain network.

**IMPORTANT:**
Besu relies on EthSigner to provider signing wallets, and EthSigner currently only supports a single signing account. The result is that the EEA Admin signing account is available at the endpoint `http://localhost:22001`, and the Org1 Admin signing account is available at the endpoint `http://localhost:23001`. The various migration steps rely on different signing accounts, which are defined by the truffle networks. Make sure to use the appropriate `-f` and `--to` parameters for the intended migration steps that are associated with the proper `--network`.

### Deploying Token Contracts
Ten smart contracts need to work together to support the on-chain logic. To properly deploy them, use the logic in migrations/2_deploy_contracts.js

Note this is using the EEA Admin signing account available on network `devcon_eea`:
```
cd <project root>
truffle migrate -f 1 --to 2 --network devcon_eea
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

### Update contract address in TEE Listener
The tee-listener container requires a TCF_CONTRACTADDRESS pointing to the EEAOperator contract deployed above. Capture the address from the output and set environment variable `EEAOPERATOR` to that value. Then recreate the tee-listener container by running the command again:

```
docker-compose up -d
```

### EEA Admin registers organizations that can receive reward tokens
Call the `EEAClaimsIssuer` contract to register organization 1 (at address `0xb36b1934004385bfa5c51eaecb8ec348ec733ca8`) to be a legitimate token receiver.

Note this is using the EEA Admin signing account available on network `devcon_eea`:
```
truffle migrate -f 3 --to 3 --network devcon_eea
```

Output:
```
3_register_orgs.js
==================
Using these contracts:
    EEAClaimsIssuer address: 0x5972EA9d0c0f635bbcb7B404DCEcD7F5D6A03417
Registering organization 0xb36b1934004385bfa5c51eaecb8ec348ec733ca8 with the claim issuer contract

   > Saving migration to chain.
   -------------------------------------
   > Total cost:                   0 ETH
```

### Org1 admin adds employee1 as delegate
Call the `EthereumDIDRegistry` contract to register employee (0xa8d1ddc96a08b44020b1eca4c4b63ab55d7fdb69) under organization 1.

Note this is using the Org1 Admin signing account available on network `devcon_org1`:
```
truffle migrate --from 4 --to 4 --network devcon_org1
```

Output:
```
4_add_delegates_org1.js
=======================
Using these contracts:
    DIDRegistry address: 0xBEB4E010DBFC38B8ce90a6663F290374c2f23241
Org1 admin adds employee 0xa8d1ddc96a08b44020b1eca4c4b63ab55d7fdb69 as a delegate

   > Saving migration to chain.
   -------------------------------------
   > Total cost:                   0 ETH
```

### EEA Admin mints reward tokens to organization delegates
Call the `EEAOperator` contract to batch mint tokens.

Note this is using the EEA Admin signing account available on network `devcon_eea`:
```
truffle migrate -f 5 --to 5 --network devcon_eea
```

Output:
```
5_mint_tokens.js
================
Using these contracts:
    EEAOperator address: 0x8614c229020EbF1F593862E7Ad5a242eE3dE938E
Issuing reward token to employee 0xa8d1ddc96a08b44020b1eca4c4b63ab55d7fdb69 in organization 0xb36b1934004385bfa5c51eaecb8ec348ec733ca8

   > Saving migration to chain.
   -------------------------------------
   > Total cost:                   0 ETH
```

### Check balance
Call the `EEAOperator` contract to retrieve the balance of the employee in organization 1.

```
truffle migration -f 6 --to 6 --network devcon_eea
```

Output:
```
6_get_balance.js
================
Using these contracts:
    EEAOperator address: 0x8614c229020EbF1F593862E7Ad5a242eE3dE938E
Resulting balance: rewards - 0, penalties - 0, reputations - 1000000000000000000

   > Saving migration to chain.
   -------------------------------------
   > Total cost:                   0 ETH
```

### Issue minting commands to the TEE listener
The tee-listener container implements APIs that invokes the Trusted Execution Environment worker node to execute business logic evaluating the request and submit transactions to the target blockchain to issue reward or penalty tokens.

Use the following command to invoke the API to issue a reward token to employee1 in organization 1:
```
curl -X POST -d 'issue_burn_tokens[]:[{"organization_ID":"did:ethr:b36b1934004385bfa5c51eaecb8ec348ec733ca8","token_request":[{"account": "did:ethr:a8d1ddc96a08b44020b1eca4c4b63ab55d7fdb69", "type":3, "success": false}]}]' -H "Content-Type: application/text" 127.0.0.1:5000/
```

Notice that `b36b1934004385bfa5c51eaecb8ec348ec733ca8` used above is the account address of organization 1. `a8d1ddc96a08b44020b1eca4c4b63ab55d7fdb69` is account address of employee 1 in that organization.

## TODO
* add front-end container to docker-compose
