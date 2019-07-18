const EEAOperator = artifacts.require("EEAOperator");
const RewardToken = artifacts.require("RewardToken");
const PenaltyToken = artifacts.require("PenaltyToken");
const ReputationToken = artifacts.require("ReputationToken");

const DidRegistryContract = require('ethr-did-registry');
const Contract = require("truffle-contract");
const Web3 = require('web3');
const truffleConfig = require("../truffle-config");

require('openzeppelin-test-helpers/configure')({ web3 });
const { singletons } = require('openzeppelin-test-helpers');

module.exports = async function (deployer, network, accounts) {
  let eeaAdmin = accounts[0];

  if (network === 'dev' || network == 'kaleido') {
    // In a test environment an ERC777 token requires deploying an ERC1820 registry
    await singletons.ERC1820Registry(eeaAdmin);
  }

  let DidReg = Contract(DidRegistryContract);

  if (network === 'dev') {
    DidReg.setProvider(new Web3.providers.HttpProvider('http://localhost:8545'));
  }

  if (network === 'kaleido') {
    DidReg.setProvider(truffleConfig.networks.kaleido.provider());
  }
  let didReg = await DidReg.new({from: eeaAdmin});


  let operator = await deployer.deploy(EEAOperator, 1, 1, {from: eeaAdmin});

  let tokenOperators = [eeaAdmin, operator.address];
  let penaltyToken = await deployer.deploy(PenaltyToken, tokenOperators);
  let rewardToken = await deployer.deploy(RewardToken, tokenOperators);
  let reputationToken = await deployer.deploy(ReputationToken, tokenOperators);

  await operator.registerTokens(penaltyToken.address, rewardToken.address, reputationToken.address);
};
