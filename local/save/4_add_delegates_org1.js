const DidRegistry = artifacts.require('EthereumDIDRegistry');

// loaded from local-env/ethsigner/node1.1/keystore/account.txt
const org1 = '0xb36b1934004385bfa5c51eaecb8ec348ec733ca8';
// loaded from local-env/ethsigner/node1.2/keystore/account.txt
const employee1_Org1 = '0xa8d1ddc96a08b44020b1eca4c4b63ab55d7fdb69';

module.exports = async function (deployer, network, accounts) {
  // obtain the reference of the contracts deployed in the previous step
  let etherDid = await DidRegistry.deployed();

  console.log(`Using these contracts:
    DIDRegistry address: ${etherDid.address}`);

  const delegateType = '0x863480501959a73cc3fea35fb3cf3402b6489ac34f0a59336a628ff703cd693e';
  const validity = 1000000;
  console.log(`Org1 admin adds employee ${employee1_Org1} as a delegate`);
  await etherDid.addDelegate(org1, delegateType, employee1_Org1, validity, {from: org1});

};
