const EEAOperator = artifacts.require('EEAOperator');

// loaded from local-env/ethsigner/node1.2/keystore/account.txt
const org = '0x7ead303355152055cd689a0f6b9a343f1f9e109a';
const employee = '0x56f304f1f1535500c6b802dd9696ed087e25f573';

module.exports = async function (deployer, network, accounts) {
  let eeaAdmin = accounts[0];

  // obtain the reference of the contracts deployed in the previous step
  let eeaOperator = await EEAOperator.deployed();

  console.log(`Using these contracts:
    EEAOperator address: ${eeaOperator.address}`);

  let balance = await eeaOperator.balance(org);
  console.log(`Resulting balance for org (${org}): rewards - ${balance[0]}, penalties - ${balance[1]}, reputations - ${balance[2]}`);

  balance = await eeaOperator.balance(employee);
  console.log(`Resulting balance for employee (${employee}): rewards - ${balance[0]}, penalties - ${balance[1]}, reputations - ${balance[2]}`);
};
