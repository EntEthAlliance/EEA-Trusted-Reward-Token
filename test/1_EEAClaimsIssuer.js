/**
* @title EEA Token
* @version 1.0
* @author Mike Alonso
*/

//TODO: Check contract was instantiated correctly


import {BigNumber, getEvents} from './helpers/tools.js';
import expectThrow from './helpers/expectThrow.js';
import { on } from 'cluster';

const EEAOperator = artifacts.require('../contracts/EEAOperator.sol');
const RewardToken = artifacts.require('../contracts/RewardToken.sol');
const PenaltyToken = artifacts.require('../contracts/PenaltyToken.sol');
const ReputationToken = artifacts.require('../contracts/ReputationToken.sol');
const DidRegistryContract = artifacts.require('../contracts/EthereumDIDRegistry.sol');
const EEAClaimsIssuer = artifacts.require('../contracts/EEAClaimsIssuer.sol');
const EthereumClaimsRegistry = artifacts.require('../contracts/EthereumClaimsRegistry.sol');
const {singletons} = require('../node_modules/openzeppelin-test-helpers');

const should = require('chai') // eslint-disable-line
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('EEAClaimsIssuer', (accounts) => {
    const eeaAdmin                  = accounts[0];
    const organization1              = accounts[1];
    const employeeOrg1              = accounts[2];
    const employee2Org1             = accounts[3];
    const organization2             = accounts[4];
    const employeeOrg2              = accounts[5];
    const unauthorizedMember        = accounts[6];

    const zeroAddress = '0x0000000000000000000000000000000000000000';
    // eslint-disable-next-line new-cap
    const zero = BigNumber(0);
    const hundredTokens = new BigNumber(100000000000000000000);
    const oneToken = new BigNumber(1000000000000000000);

    // Deploy 1820 contract to network to register ERC777 interfaces

    before(async () => {
        // eslint-disable-next-line new-cap
        await singletons.ERC1820Registry(eeaAdmin);
    });

    // Set up instances and their addresses

    let etherDidInstance;
    let claimsRegInstance;
    let eeaIssuerInstance;
    let etherDidAddress;
    let claimsRegAddress;
    let eeaIssuerAddress;
    let eeaOperatorInstance;
    let rewardTokenInstance;
    let penaltyTokenInstance;
    let reputationTokenInstance;
    let eeaOperatorAddress;
    let reputationTokenAddress;
    let rewardTokenAddress;
    let penaltyTokenAddress;

    // Deploy Ether DID Registry & Ether Claims Registry

    before(async () => {
        etherDidInstance = await DidRegistryContract.new();
        claimsRegInstance = await EthereumClaimsRegistry.new();
        etherDidAddress = await etherDidInstance.address;
        claimsRegAddress = await claimsRegInstance.address;
    });

    // Deploy EEA Issuer Contract and capture address

    before(async () => {
        eeaIssuerInstance = await EEAClaimsIssuer.new(claimsRegAddress);
        eeaIssuerAddress = await eeaIssuerInstance.address;
    });




    it('EEA Claims Issuer contract insantiated correctly', async () => {
        const setPenaltyTokenAdd = await eeaOperatorInstance.penaltyToken();
        const setReputationTokenAdd = await eeaOperatorInstance.reputationToken();
        const setRewardsTokenAdd = await eeaOperatorInstance.rewardToken();
        const setDidReg = await eeaOperatorInstance.didRegistry();
        const setClaimReg = await eeaOperatorInstance.claimsRegistry();
        const setIssuer = await eeaOperatorInstance.eeaIssuer();
        const owner = await eeaOperatorInstance.owner();

        setPenaltyTokenAdd.should.be.equal(zeroAddress);
        setReputationTokenAdd.should.be.equal(zeroAddress);
        setRewardsTokenAdd.should.be.equal(zeroAddress);
        expect(setDidReg).equal(etherDidAddress);
        expect(setClaimReg).equal(claimsRegAddress);
        expect(setIssuer).equal(eeaIssuerAddress);
        expect(owner).equal(eeaAdmin);
    });


});