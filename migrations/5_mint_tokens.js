var BigNumber = require('bn.js');
const EEAOperator = artifacts.require('EEAOperator');

// loaded from local-env/ethsigner/node1.1/keystore/account.txt
const org1 = '0xb36b1934004385bfa5c51eaecb8ec348ec733ca8';
// loaded from local-env/ethsigner/node1.2/keystore/account.txt
const employee1_Org1 = '0xa8d1ddc96a08b44020b1eca4c4b63ab55d7fdb69';

const oneToken = new BigNumber('1000000000000000000');

module.exports = async function (deployer, network, accounts) {
  let eeaAdmin = accounts[0];

  // obtain the reference of the contracts deployed in the previous step
  let eeaOperator = await EEAOperator.deployed();

  console.log(`Using these contracts:
    EEAOperator address: ${eeaOperator.address}`);

  console.log(`Issuing reward token to employee ${employee1_Org1} in organization ${org1}`);
  await eeaOperator.batchMintRewards([org1], [employee1_Org1], [oneToken], {from: eeaAdmin});
};
