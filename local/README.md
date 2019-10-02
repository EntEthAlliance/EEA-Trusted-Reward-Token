# Local Environment for Testing EEA Trusted Tokens
This is a self-contained environment based on docker and deployed with docker-compose, to test the end to end components that make up the EEA Trusted Tokens project.

## Architecture
![Deployment](/images/deployment-arch.png) 

## Setup and Launch
The system is comprised of 3 major components:
* Besu blockchain
* TEE Listener and TEE Worker nodes
* UI backend and frontend

Launching the system requires setting up one component at a time.

### Besu Blockchain
The Besu blockchain is ready to be launched:

```
cd local-env
docker-compose pull
docker-compose up -d
```

The Ethereum RPC endpoints for the two Besu nodes are:
* http://localhost:22001
  * signing account: 0x7085d4d4c6efea785edfba5880bb62574e115626 (EEA Admin)
* http://localhost:23001
  * signing account: 0xb36b1934004385bfa5c51eaecb8ec348ec733ca8

### Deploying Token Contracts
Ten smart contracts need to work together to support the on-chain logic. To properly deploy them, use the logic in migrations/2_deploy_contracts.js

Note this is using the EEA Admin signing account available on network `devcon`:
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

### TEE Listener and TCF Worker Nodes
First create the docker volume that will be shared between the TEE Listener container and the TCF Worker node container instances.

```
docker volume create sim_v
```

The tee-listener container requires a TCF_CONTRACTADDRESS pointing to the EEAOperator contract deployed above. Verify that the address has been updated in the file `local/tee-listener/init.env` and match the address for EEAOperator as printed in the step above.

Then launch the tee-listener container by running the command:

```
docker-compose -f docker-compose_tee.yaml up -d
```

### UI Backend and Frontend
The UI microservice requires pointers to the various smart contracts deployed above. Verify that the addresses have been updated in the file `local/ui/server.env`.

Launch the UI layer:

```
docker-compose -f docker-compose_ui.yaml up -d
```

## Test The Application
Follow these steps to test driver the EEA Trusted Tokens application.

You will observe backend logs corresponding to the operations performed in the UI. In separate terminal windows, start these log streams:
```
docker logs -f local_node1.eea.org_1
docker logs -f local_tee-listener_1
docker logs -f local_eea-server_1
```

* Open the app: http://localhost
* Sign in as EEA Admin: admin/adminPwd
* Click "Member Orgs" tab and click "Register EEA Member" button
* Use dummy emails to register organizations
  * observe that in the local_node1.eea.org_1 logs, a transaction has been mined into a new block
```
2019-10-02 20:36:37.045+00:00 | EthScheduler-Workers-0 | INFO  | BlockPropagationManager | Imported #276 / 1 tx / 0 om / 70,328 (0.0%) gas / (0x2a5946fc186e469af8392bf2f8d562416d7b1bd9a1aff06cad32d044f257dda5) in 0.012s
```
* Log out and log back in using the organization credentials from the registration step above
* Click "Employees" tab and click "Register employee" button
* Use dummy emails to register employees
  * observe that in the local_node1.eea.org_1 logs, a transaction has been mined into a new block
```
2019-10-02 20:37:02.038+00:00 | EthScheduler-Workers-3 | INFO  | BlockPropagationManager | Imported #281 / 1 tx / 0 om / 55,392 (0.0%) gas / (0x7724298e8dab2719397982b93b3cc045560a855b4e6f9a73974dc0bad9003a30) in 0.011s
```
* Log out and log back in using the EEA Admin credentials
* Click "EEA Token Issuance" tab and click "Add EEA Member", select a registered organization
* Click "Add Employee" and select a registered employee
* Select a reason for issuing tokens, and click "Issue"
  * observe that in the local_tee-listener_1 logs, a new workload has been generated and dispatched to the worker node for execution
```
[2019-10-02 20:39:07,537] 172.13.0.8:51964 POST / 1.1 200 252 17404
Launching worker node with configurations:
export SCONE_QUEUES=4
export SCONE_SLOTS=256
export SCONE_SIGPIPE=0
export SCONE_MMAP32BIT=0
export SCONE_SSPINS=100
export SCONE_SSLEEP=4000
export SCONE_LOG=0
export SCONE_HEAP=1073741824
export SCONE_STACK=2097152
export SCONE_CONFIG=/etc/sgx-musl.conf
export SCONE_ESPINS=10000
export SCONE_MODE=sim
export SCONE_ALLOW_DLOPEN=yes (unprotected)
export SCONE_MPROTECT=no
musl version: 1.1.20
Revision: 20d71e5cb024d0295eec9a6218835294645813c3 (Fri Jul 19 18:56:03 2019 +0200)
Branch: sergei-iexec-all-features (dirty)

Enclave hash: 4e6758e38f332d8eb718bc0037dbdedd00d3bb196dd3ff894938b32156179c38
EEA trusted token execution logic starts running in TEE simulation mode.
/mode_sim/data/cj1tcjak
8347bc123e06072a2e33b9981a2facd2254f0706cc8706adca43ec2129df8c46
issue_burn_tokens[]:[{"organization_ID":"did:ethr:7ead303355152055cd689a0f6b9a343f1f9e109a","token_request":[{"account":"did:ethr:56f304f1f1535500c6b802dd9696ed087e25f573","type":3,"success":true}]}]
batchMintRewards: 0x708b83b6dcbd17c445f53dc87cf5deae2dfffa275bfdfb5070f71beb78d3debc
batchMintPenalties: 0xb8bb5f970c5a0bff3b008b73db17d08ee62e00a88281e95f528ee1189557b065
```
  * observe that in the local_node1.eea.org_1 logs, two new transactions have been mined into a new block
```
2019-10-02 20:39:12.108+00:00 | EthScheduler-Workers-2 | INFO  | BlockPropagationManager | Imported #307 / 2 tx / 0 om / 212,200 (0.0%) gas / (0xd07d28f15be9963b75a91fdd8523fa10382d6d0a74a234e618e3843713ce960c) in 0.024s
```
