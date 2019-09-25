const EEAOperator = artifacts.require('EEAOperator');
const RewardToken = artifacts.require('RewardToken');
const PenaltyToken = artifacts.require('PenaltyToken');
const ReputationToken = artifacts.require('ReputationToken');
const DidRegistryContract = artifacts.require('EthereumDIDRegistry');
const EEAClaimsIssuer = artifacts.require('EEAClaimsIssuer');
const EthereumClaimsRegistry = artifacts.require('EthereumClaimsRegistry');
const WorkerRegistry = artifacts.require('WorkerRegistry')
const WorkOrderRegistry = artifacts.require('WorkOrderRegistry')

const Contract = require('../node_modules/truffle-contract');
const Web3 = require('../node_modules/web3');
const truffleConfig = require('../truffle-config');

require('../node_modules/openzeppelin-test-helpers/configure')({ web3 });
const {singletons} = require('../node_modules/openzeppelin-test-helpers');

module.exports = async function (deployer, network, accounts) {
    let eeaAdmin = accounts[0];
    /* Test
    if (network === 'dev' || network === 'kaleido') {
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
    */

    await singletons.ERC1820Registry(eeaAdmin);
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
};
