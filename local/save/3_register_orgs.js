const EEAClaimsIssuer = artifacts.require('EEAClaimsIssuer');

// loaded from local-env/ethsigner/node1.1/keystore/account.txt
const org1 = '0xb36b1934004385bfa5c51eaecb8ec348ec733ca8';

module.exports = async function (deployer, network, accounts) {
  let eeaAdmin = accounts[0];

  // obtain the reference of the contracts deployed in the previous step
  let eeaIssuer = await EEAClaimsIssuer.deployed();

  console.log(`Using these contracts:
    EEAClaimsIssuer address: ${eeaIssuer.address}`);

  console.log(`Registering organization ${org1} with the claim issuer contract`);
  await eeaIssuer.setMembershipClaim(org1, {from: eeaAdmin});
};
