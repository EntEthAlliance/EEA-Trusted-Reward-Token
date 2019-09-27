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
* http://localhost:23001
