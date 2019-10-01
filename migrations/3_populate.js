const EEAOperator = artifacts.require('EEAOperator');
const DidRegistryContract = artifacts.require('EthereumDIDRegistry');
const EEAClaimsIssuer = artifacts.require('EEAClaimsIssuer');
const EthereumClaimsRegistry = artifacts.require('EthereumClaimsRegistry');

// loaded from local-env/ethsigner/node2.1/keystore/account.txt
const Org1 = '0xb36b1934004385bfa5c51eaecb8ec348ec733ca8';
// loaded from local-env/ethsigner/node2.2/keystore/account.txt
const Org2 = '0xa8d1ddc96a08b44020b1eca4c4b63ab55d7fdb69';

module.exports = async function (deployer, network, accounts) {
    let eeaAdmin = accounts[0];

    let eeaIssuer = await EEAClaimsIssuer.deployed();

    console.log('EEAClaimsIssuer address', eeaIssuer);
};
