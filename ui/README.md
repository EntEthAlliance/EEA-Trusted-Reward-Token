# Trusted-Token-UI

## The EEA Trusted Token UI has two main parts: the Front End and the Server. There are three ways to experience and interact with the UI and all of it’s parts.

### 1. To run the fully functional UI and experience interactions with the rest of the EEA Trusted Token use case infrastructure components such as the TEE and the smart contracts deployed to the Besu client, please refer to the instructions in the /local directory here: https://github.com/EntEthAlliance/EEA-Trusted-Reward-Token/tree/devcon/local

### 2. If you want to run the UI with limited functionality (ie. without interacting with the rest of the EEA Trusted Token use case infrastructure components such as the TEE and the smart contracts deployed to the Besu client) inside a locally deployed docker container that does all of the build for you; run the following commands listed below:

```
git clone -b devcon --single-branch https://github.com/EntEthAlliance/EEA-Trusted-Reward-Token.git
cd EEA-Trusted-Reward-Token\ui
docker-compose up
```

After the successfull start of all docker containers, open http://localhost

### 3. This last method is if you want to manually build the UI’s 2 main parts (Front End and Server) and run without docker, but rather locally in Node. Note that this will also run the UI with limited functionality (ie. without interacting with the rest of the EEA Trusted Token use case infrastructure components such as the TEE and the smart contracts deployed to the Besu client).

Inside EEA-Trusted-Reward-Token/tree/devcon/ui/client

```
npm i

npm run build 

npm start

```
This will build the artifacts that contain all of the assets we need to serve the web site

Inside EEA-Trusted-Reward-Token/tree/devcon/ui/server

```
npm i
npm start

```
Keep in mind that we need to preserve `node_modules` folder for server deployment

