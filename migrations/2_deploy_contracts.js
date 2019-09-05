const EEAOperator = artifacts.require('../contracts/EEAOperator.sol');
const RewardToken = artifacts.require('../contracts/RewardToken.sol');
const PenaltyToken = artifacts.require('../contracts/PenaltyToken.sol');
const ReputationToken = artifacts.require('../contracts/ReputationToken.sol');
const DidRegistryContract = artifacts.require('../contracts/EthereumDIDRegistry.sol');
const EEAClaimsIssuer = artifacts.require('../contracts/EEAClaimsIssuer.sol');
const EthereumClaimsRegistry = artifacts.require('../contracts/EthereumClaimsRegistry.sol');

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
    
};
