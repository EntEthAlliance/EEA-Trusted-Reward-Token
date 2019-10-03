const EEAOperator = artifacts.require('EEAOperator');
const RewardToken = artifacts.require('RewardToken');
const PenaltyToken = artifacts.require('PenaltyToken');
const ReputationToken = artifacts.require('ReputationToken');
const DidRegistryContract = artifacts.require('EthereumDIDRegistry');
const EEAClaimsIssuer = artifacts.require('EEAClaimsIssuer');
const EthereumClaimsRegistry = artifacts.require('EthereumClaimsRegistry');
const WorkerRegistry = artifacts.require('WorkerRegistry')
const WorkOrderRegistry = artifacts.require('WorkOrderRegistry')

const Contract = require('truffle-contract');
const Web3 = require('web3');
const fs = require('fs-extra');
const join = require('path').join;
const truffleConfig = require('../truffle-config');

require('../node_modules/openzeppelin-test-helpers/configure')({ web3 });
const {singletons} = require('../node_modules/openzeppelin-test-helpers');

function isPublicNetwork(network) {
  const list = ["dev", "devcon", "kaleido"];
  if (list.indexOf(network) >= 0)
    return false;
  else
    return true;
}

// update settings in local environments with addressed of deployed contracts
async function updateLocalEnv(erc1820, ethDid, ethClaims, eeaClaimsIssuer, eeaOperator, eeaPenalty, eeaReputation, eeaReward) {
  console.log(`Updating ui/server.env:
    ERC1820Registry: ${erc1820}
    EthereumDIDRegistry: ${ethDid}
    EthereumClaimsRegistry: ${ethClaims}
    EAClaimsIssuer: ${eeaClaimsIssuer}
    EAOperator: ${eeaOperator}
    PenaltyToken: ${eeaPenalty}
    ReputationToken: ${eeaReputation}
    RewardToken: ${eeaReward}
  `);

  let env = await fs.readFileSync(join(__dirname, '../local/ui/server.env'));
  env = env.toString();

  env = env.replace(/CONTRACT_EERC1820Registry=0x[0-9a-fA-F]{40}/, `CONTRACT_EERC1820Registry=${erc1820}`);
  env = env.replace(/CONTRACT_EEthereumDIDRegistry=0x[0-9a-fA-F]{40}/, `CONTRACT_EEthereumDIDRegistry=${ethDid}`);
  env = env.replace(/CONTRACT_EEthereumClaimsRegistry=0x[0-9a-fA-F]{40}/, `CONTRACT_EEthereumClaimsRegistry=${ethClaims}`);
  env = env.replace(/CONTRACT_EEAClaimsIssuer=0x[0-9a-fA-F]{40}/, `CONTRACT_EEAClaimsIssuer=${eeaClaimsIssuer}`);
  env = env.replace(/CONTRACT_EEAOperator=0x[0-9a-fA-F]{40}/, `CONTRACT_EEAOperator=${eeaOperator}`);
  env = env.replace(/CONTRACT_EPenaltyToken=0x[0-9a-fA-F]{40}/, `CONTRACT_EPenaltyToken=${eeaPenalty}`);
  env = env.replace(/CONTRACT_EReputationToken=0x[0-9a-fA-F]{40}/, `CONTRACT_EReputationToken=${eeaReputation}`);
  env = env.replace(/CONTRACT_ERewardToken=0x[0-9a-fA-F]{40}/, `CONTRACT_ERewardToken=${eeaReward}`);

  await fs.writeFileSync(join(__dirname, '../local/ui/server.env'), env);

  console.log(`Updating tee-listener/init.env:
    EAOperator: ${eeaOperator}
  `);

  env = await fs.readFileSync(join(__dirname, '../local/tee-listener/init.env'));
  env = env.toString();

  env = env.replace(/TCF_CONTRACTADDRESS=0x[0-9a-fA-F]{40}/, `TCF_CONTRACTADDRESS=${eeaOperator}`);
  await fs.writeFileSync(join(__dirname, '../local/tee-listener/init.env'), env);
}

module.exports = async function (deployer, network, accounts) {
  let eeaAdmin = accounts[0];
  if (!isPublicNetwork(network)) {
      // In a test environment an ERC777 token requires deploying an ERC1820 registry
      await singletons.ERC1820Registry(eeaAdmin);
  }
  
  let DidReg = Contract(DidRegistryContract);

  if (!isPublicNetwork(network)) {
    if (network === 'kaleido') {
      DidReg.setProvider(truffleConfig.networks.kaleido.provider());
    } else {
      DidReg.setProvider(new Web3.providers.HttpProvider(`http://${truffleConfig.networks[network].host}:${truffleConfig.networks[network].port}`));
    }
  }

  let erc1820Reg = await singletons.ERC1820Registry(eeaAdmin);
  let didReg = await deployer.deploy(DidRegistryContract);
  let claimsReg = await deployer.deploy(EthereumClaimsRegistry);
  let eeaIssuer = await deployer.deploy(EEAClaimsIssuer, claimsReg.address, {from: eeaAdmin});
  let operator = await deployer.deploy(EEAOperator, didReg.address, claimsReg.address, eeaIssuer.address, {from: eeaAdmin});
  let tokenOperators = [eeaAdmin, operator.address];
  let penaltyToken = await deployer.deploy(PenaltyToken, tokenOperators);
  let reputationToken = await deployer.deploy(ReputationToken, tokenOperators);
  let rewardToken = await deployer.deploy(RewardToken, tokenOperators, didReg.address, claimsReg.address, eeaIssuer.address);
  await operator.registerTokens(penaltyToken.address, rewardToken.address, reputationToken.address);

  await deployer.deploy(WorkerRegistry);
  await deployer.deploy(WorkOrderRegistry);

  await updateLocalEnv(
    erc1820Reg.address,
    didReg.address,
    claimsReg.address,
    eeaIssuer.address,
    operator.address,
    penaltyToken.address,
    reputationToken.address,
    rewardToken.address);
};
