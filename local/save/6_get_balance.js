const EEAOperator = artifacts.require('EEAOperator');

// loaded from local-env/ethsigner/node1.2/keystore/account.txt
const employee1_Org1 = '0xa8d1ddc96a08b44020b1eca4c4b63ab55d7fdb69';

module.exports = async function (deployer, network, accounts) {
  let eeaAdmin = accounts[0];

  // obtain the reference of the contracts deployed in the previous step
  let eeaOperator = await EEAOperator.deployed();

  console.log(`Using these contracts:
    EEAOperator address: ${eeaOperator.address}`);

  let balance = await eeaOperator.balance(employee1_Org1);
  console.log(`Resulting balance: rewards - ${balance[0]}, penalties - ${balance[1]}, reputations - ${balance[2]}`);
};
