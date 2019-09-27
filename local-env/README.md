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
  * signing account: 0x7085d4d4c6efea785edfba5880bb62574e115626
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
* tee-listener was able to launch TCF enclave to process the token logic, but results in an error:

```
Running on https://0.0.0.0:5000 (CTRL + C to quit)
[2019-09-27 18:14:52,126] ASGI Framework Lifespan error, continuing without Lifespan support
[2019-09-27 18:16:11,922] 172.20.0.1:44836 POST / 1.1 200 556 15079
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
Traceback (most recent call last):
  File "/mode_sim/signer/sign_sim.py", line 82, in <module>
    with open('/mode_sim/data/sign_key') as sf:
FileNotFoundError: [Errno 2] No such file or directory: '/mode_sim/data/sign_key'
```
* add front-end container to docker-compose
