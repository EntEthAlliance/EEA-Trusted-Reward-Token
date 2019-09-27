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
