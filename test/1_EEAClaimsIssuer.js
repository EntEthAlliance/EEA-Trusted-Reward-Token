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
        const claimsRegistryContract = await eeaIssuerInstance.claimsRegistry();
        const owner = await eeaIssuerInstance.owner();

        claimsRegistryContract.should.be.equal(claimsRegAddress);
        expect(owner).equal(eeaAdmin);
    });






    describe('set Membership Claim', function () {
        const org1 = organization1;
        const org2 = organization2;
        describe('when the sender is the EEA Issuer', function () {
            describe('When the recipient is an EEA member', function () {
                describe('but sets the wrong organization/employee', function () {
                    it('reverts', async function () {
                        await expectThrow(eeaOperatorInstance.mintRewards(organization2, to, amount, '0x0', {
                            from: eeaAdmin
                        }));
                    });
                });
                describe('mints reputation for employee/organization and rewards for organization', function () {
                    it('succeeds', async function () {
                        await eeaOperatorInstance.mintRewards(org, to, amount, '0x0', {
                            from: eeaAdmin
                        });
                        const memberBalanceRep = await reputationTokenInstance.balanceOf(to);
                        const memberBalanceRewards = await rewardTokenInstance.balanceOf(to);
                        const orgBalanceRep = await reputationTokenInstance.balanceOf(org);
                        const orgBalanceRewards = await rewardTokenInstance.balanceOf(org);

                        assert.equal(memberBalanceRep.toString(), amount.toString());
                        assert.equal(memberBalanceRewards.toString(), zero.toString());
                        assert.equal(orgBalanceRep.toString(), amount.toString());
                        assert.equal(orgBalanceRewards.toString(), amount.toString());
                    });
                    it('and emits a "ReputationMinted" and "RewardsMinted" event', async function () {
                        const tx = await eeaOperatorInstance.mintRewards(org, to, amount, '0x0', {
                            from: eeaAdmin
                        });
                        // Test the event

                        const event1 = getEvents(tx, 'ReputationMinted');
                        const event2 = getEvents(tx, 'RewardsMinted');

                        assert.equal(event1[0].account, to, 'To address does not match');
                        (event1[0].amount.toString()).should.be.equal(amount.toString());
                        assert.equal(event1[0].operatorData, '0x00', 'Data does not match');

                        assert.equal(event1[1].account, org, 'To address does not match');
                        (event1[1].amount.toString()).should.be.equal(amount.toString());
                        assert.equal(event1[1].operatorData, '0x00', 'Data does not match');

                        assert.equal(event2[0].account, org, 'To address does not match');
                        (event2[0].amount.toString()).should.be.equal(amount.toString());
                        assert.equal(event2[0].operatorData, '0x00', 'Data does not match');
                    });
                });
            });
            describe('when the recipient is not an EEA member', function () {
                const to = unauthorizedMember;
                const amount = hundredTokens;
                it('reverts', async function () {
                    await expectThrow(eeaOperatorInstance.mintRewards(to, to, amount, '0x0', {
                        from: eeaAdmin
                    }));
                });
            });
            describe('when the recipient is the zero address', function () {
                const to = zeroAddress;
                const amount = hundredTokens;
                it('reverts', async function () {
                    await expectThrow(eeaOperatorInstance.mintRewards(organization1, to, amount, '0x0', {
                        from: eeaAdmin
                    }));
                });
            });
        });
        describe('when the sender is not the EEA issuer', function () {
            it('reverts', async function () {
                await expectThrow(eeaOperatorInstance.mintRewards(org, to, amount, '0x0', {
                    from: unauthorizedMember
                }));
            });
        });
    });


});