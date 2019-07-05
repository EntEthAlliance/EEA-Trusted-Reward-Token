const EEAOperator = artifacts.require("EEAOperator");
const RewardToken = artifacts.require("RewardToken");
const PenaltyToken = artifacts.require("PenaltyToken");
const ReputationToken = artifacts.require("ReputationToken");

require('openzeppelin-test-helpers/configure')({ web3 });

const { singletons } = require('openzeppelin-test-helpers');

module.exports = async function (deployer, network, accounts) {
  let eeaAdmin = accounts[0];

  if (network === 'dev') {
    // In a test environment an ERC777 token requires deploying an ERC1820 registry
    await singletons.ERC1820Registry(eeaAdmin);
  }


  let operator = await deployer.deploy(EEAOperator, 1, 1, {from: eeaAdmin});

  let tokenOperators = [eeaAdmin, operator.address];
  let penaltyToken = await deployer.deploy(PenaltyToken, tokenOperators);
  let rewardToken = await deployer.deploy(RewardToken, tokenOperators);
  let reputationToken = await deployer.deploy(ReputationToken, tokenOperators);

  await operator.registerTokens(penaltyToken.address, rewardToken.address, reputationToken.address);
};
