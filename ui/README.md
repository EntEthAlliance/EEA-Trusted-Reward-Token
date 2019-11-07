# Trusted-Token-UI

## How to run docker-compose locally

```
git clone -b devcon --single-branch https://github.com/EntEthAlliance/EEA-Trusted-Reward-Token.git
cd Trusted-Token-UI
docker-compose up
```

After the successfull start of all docker containers, open http://localhost

## How to deploy
### client

```
npm i

npm run build // => client/dist/client
```
Built artifacts contain all assets we need to serve web site

### server
```
// clone server folder to destination folder
npm i
npm run build // => server/dist

node ./dist/src/index.js
```
Keep in mind that we need to preserve `node_modules` folder for server deployment

