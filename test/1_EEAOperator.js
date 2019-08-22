/**
* @title EEA Token
* @version 1.0
* @author Mike Alonso
*/

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

contract('EEAOperator', (accounts) => {
    const eeaAdmin                  = accounts[0];
    const organization1              = accounts[1];
    const employeeOrg1              = accounts[2];
    const employee2Org1             = accounts[3];
    const organization2             = accounts[4];
    const employeeOrg2              = accounts[5];
    const unauthorizedMember        = accounts[6];

    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const zero = BigNumber(0);
    const hundredTokens = new BigNumber(100000000000000000000);
    const oneToken = new BigNumber(1000000000000000000);

    // Deploy 1820 contract to network to register ERC777 interfaces

    before(async () => {
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

    // Deploy EEA Operator Contract

    before(async () => {
        eeaOperatorInstance = await EEAOperator.new(etherDidAddress, claimsRegAddress, eeaIssuerAddress);
        eeaOperatorAddress = await eeaOperatorInstance.address;
    });

    // Deploy Token Contracts

    before(async () => {
        reputationTokenInstance = await ReputationToken.new([eeaOperatorAddress]);
        penaltyTokenInstance = await PenaltyToken.new([eeaOperatorAddress]);
        rewardTokenInstance = await RewardToken.new([eeaOperatorAddress], etherDidAddress, claimsRegAddress, eeaIssuerAddress);
        reputationTokenAddress = await reputationTokenInstance.address;
        rewardTokenAddress = await rewardTokenInstance.address;
        penaltyTokenAddress = await penaltyTokenInstance.address;
    });

    // Register Organization Claims Through Issuer

    before(async () => {
        await eeaIssuerInstance.setMembershipClaim(organization1, {from: eeaAdmin});
        await eeaIssuerInstance.setMembershipClaim(organization2, {from: eeaAdmin});
    });

    // Each Organization claim employees as delegates through DID registry

    before(async () => {
    // Delegate type = keccak256("employee")
        const delegateType = '0x863480501959a73cc3fea35fb3cf3402b6489ac34f0a59336a628ff703cd693e';
        const validity = 1000000;
        await etherDidInstance.addDelegate(organization1, delegateType, employeeOrg1, validity, {from: organization1});
        await etherDidInstance.addDelegate(organization1, delegateType, employee2Org1, validity, {from: organization1});
        await etherDidInstance.addDelegate(organization2, delegateType, employeeOrg2, validity, {from: organization2});
    });

    it('should instantiate tokens', async () => {
        reputationTokenAddress.should.not.equal(zero);
        rewardTokenAddress.should.not.equal(zero);
        penaltyTokenAddress.should.not.equal(zero);
    });

    it('operator contract insantiated correctly', async () => {
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

    it('successfully sets token contracts', async () => {
        await eeaOperatorInstance.registerTokens(penaltyTokenAddress, rewardTokenAddress, reputationTokenAddress, {
            from: eeaAdmin
        });

        const setPenaltyTokenAdd = await eeaOperatorInstance.penaltyToken();
        const setReputationTokenAdd = await eeaOperatorInstance.reputationToken();
        const setRewardsTokenAdd = await eeaOperatorInstance.rewardToken();
        expect(setPenaltyTokenAdd).equal(penaltyTokenAddress);
        expect(setReputationTokenAdd).equal(reputationTokenAddress);
        expect(setRewardsTokenAdd).equal(rewardTokenAddress);
    });

    describe('mint rewards', function () {
        describe('when the recipient is an EEA member', function () {
            const to = employeeOrg1;
            const amount = hundredTokens;
            const org = organization1;
            describe('when the sender is not the EEA issuer', function () {
                it('reverts', async function () {
                    await expectThrow(eeaOperatorInstance.mintRewards(org, to, amount, '0x0', {
                        from: unauthorizedMember
                    }));
                });
            });
            describe('when the sender is the EEA issuer, but sets the wrong organization', function () {
                it('reverts', async function () {
                    await expectThrow(eeaOperatorInstance.mintRewards(organization2, to, amount, '0x0', {
                        from: eeaAdmin
                    }));
                });
            });
            describe('when the sender is the EEA issuer', function () {
                it('mints reputation for employee/organization and rewards for organization', async function () {
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
                it('emits a transfer event', async function () {
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


    describe('batch mint rewards', function () {
        const amountArray = [oneToken, oneToken, oneToken];
        describe('when all recipients are EEA members', function () {
            const toArray = [employeeOrg1, employee2Org1, employeeOrg2];
            const orgArray = [organization1, organization1, organization2];
            describe('when the sender is not the EEA issuer', function () {
                it('reverts', async function () {
                    await expectThrow(eeaOperatorInstance.batchMintRewards(orgArray, toArray, amountArray, {
                        from: unauthorizedMember
                    }));
                });
            });
            describe('when the sender is the EEA issuer, but mismatches all the organizations/employees and tokens are not mint', function () {
                it('does not mint but emits an event', async function () {
                    const bungledOrgArray = [organization2, organization2, organization1];
                    const oldBalance1 = await reputationTokenInstance.balanceOf(employeeOrg1);
                    const oldBalance2 = await reputationTokenInstance.balanceOf(employee2Org1);
                    const oldBalance3 = await reputationTokenInstance.balanceOf(employeeOrg2);
                    const tx = await eeaOperatorInstance.batchMintRewards(bungledOrgArray, toArray, amountArray, {
                        from: eeaAdmin
                    });

                    const afterBalance1 = await reputationTokenInstance.balanceOf(employeeOrg1);
                    const afterBalance2 = await reputationTokenInstance.balanceOf(employee2Org1);
                    const afterBalance3 = await reputationTokenInstance.balanceOf(employeeOrg2);
                    (oldBalance1.toString()).should.be.equal(afterBalance1.toString());
                    (oldBalance2.toString()).should.be.equal(afterBalance2.toString());
                    (oldBalance3.toString()).should.be.equal(afterBalance3.toString());

                    // Test the event

                    const event1 = getEvents(tx, 'batchMintError');

                    assert.equal(event1[0].organization, organization2, 'address does not match');
                    assert.equal(event1[0].account, employeeOrg1, 'address does not match');
                    (event1[0].amount.toString()).should.be.equal(oneToken.toString());

                    assert.equal(event1[1].organization, organization2, 'address does not match');
                    assert.equal(event1[1].account, employee2Org1, 'address does not match');
                    (event1[1].amount.toString()).should.be.equal(oneToken.toString());

                    assert.equal(event1[2].organization, organization1, 'address does not match');
                    assert.equal(event1[2].account, employeeOrg2, 'address does not match');
                    (event1[2].amount.toString()).should.be.equal(oneToken.toString());
                });
            });
            describe('when the sender is the EEA issuer', function () {
                it('batch mints reputation for employee/organization and rewards for organization', async function () {
                    await eeaOperatorInstance.batchMintRewards(orgArray, toArray, amountArray, {
                        from: eeaAdmin
                    });

                    const employee1RepBal = await reputationTokenInstance.balanceOf(employeeOrg1);
                    const employee2RepBal = await reputationTokenInstance.balanceOf(employee2Org1);
                    const employee3RepBal = await reputationTokenInstance.balanceOf(employeeOrg2);
                    const employee1RewardBal = await rewardTokenInstance.balanceOf(employeeOrg1);
                    const employee2RewardBal = await rewardTokenInstance.balanceOf(employee2Org1);
                    const employee3RewardBal = await rewardTokenInstance.balanceOf(employeeOrg2);
                    const org1RepBal = await reputationTokenInstance.balanceOf(organization1);
                    const org2RepBal = await reputationTokenInstance.balanceOf(organization2);
                    const org1RewardBal = await rewardTokenInstance.balanceOf(organization1);
                    const org2RewardBal = await rewardTokenInstance.balanceOf(organization2);

                    assert.equal(employee1RepBal.toString(), '201000000000000000000');
                    assert.equal(employee2RepBal.toString(), oneToken.toString());
                    assert.equal(employee3RepBal.toString(), oneToken.toString());
                    assert.equal(employee1RewardBal.toString(), zero.toString());
                    assert.equal(employee2RewardBal.toString(), zero.toString());
                    assert.equal(employee3RewardBal.toString(), zero.toString());
                    assert.equal(org1RepBal.toString(), '202000000000000000000');
                    assert.equal(org2RepBal.toString(), oneToken.toString());
                    assert.equal(org1RewardBal.toString(), '202000000000000000000');
                    assert.equal(org2RewardBal.toString(), oneToken.toString());
                });
                it('emits a transfer event', async function () {
                    const tx = await eeaOperatorInstance.batchMintRewards(orgArray, toArray, amountArray, {
                        from: eeaAdmin
                    });

                    // Test the event

                    const event1 = getEvents(tx, 'ReputationMinted');
                    const event2 = getEvents(tx, 'RewardsMinted');

                    assert.equal(event1[0].account, employeeOrg1, 'To address does not match');
                    (event1[0].amount.toString()).should.be.equal(oneToken.toString());

                    assert.equal(event1[1].account, organization1, 'To address does not match');
                    (event1[1].amount.toString()).should.be.equal(oneToken.toString());

                    assert.equal(event1[2].account, employee2Org1, 'To address does not match');
                    (event1[2].amount.toString()).should.be.equal(oneToken.toString());

                    assert.equal(event1[3].account, organization1, 'To address does not match');
                    (event1[3].amount.toString()).should.be.equal(oneToken.toString());

                    assert.equal(event1[4].account, employeeOrg2, 'To address does not match');
                    (event1[4].amount.toString()).should.be.equal(oneToken.toString());

                    assert.equal(event1[5].account, organization2, 'To address does not match');
                    (event1[5].amount.toString()).should.be.equal(oneToken.toString());

                    assert.equal(event2[0].account, organization1, 'To address does not match');
                    (event2[0].amount.toString()).should.be.equal(oneToken.toString());

                    assert.equal(event2[1].account, organization1, 'To address does not match');
                    (event2[1].amount.toString()).should.be.equal(oneToken.toString());

                    assert.equal(event2[2].account, organization2, 'To address does not match');
                    (event2[2].amount.toString()).should.be.equal(oneToken.toString());
                });
            });
        });
        describe('when the recipient is not an EEA member', function () {
            const toArray = [unauthorizedMember, unauthorizedMember, unauthorizedMember];
            const amountArray = [hundredTokens, hundredTokens, hundredTokens];
            const orgArray = [unauthorizedMember, unauthorizedMember, unauthorizedMember];
            it('does not mint tokens but emits an event', async function () {
                const oldRepBalance = await reputationTokenInstance.balanceOf(unauthorizedMember);
                const oldRewardsBalance = await rewardTokenInstance.balanceOf(unauthorizedMember);
                const tx = await eeaOperatorInstance.batchMintRewards(orgArray, toArray, amountArray, {
                    from: eeaAdmin
                });

                const newRepBalance = await reputationTokenInstance.balanceOf(unauthorizedMember);
                const newRewardsBalance = await rewardTokenInstance.balanceOf(unauthorizedMember);

                (oldRepBalance.toString()).should.be.equal(newRepBalance.toString());
                (oldRewardsBalance.toString()).should.be.equal(newRewardsBalance.toString());

                // Test the event

                const event1 = getEvents(tx, 'batchMintError');

                assert.equal(event1[0].organization, unauthorizedMember, 'address does not match');
                assert.equal(event1[0].account, unauthorizedMember, 'address does not match');
                (event1[0].amount.toString()).should.be.equal(hundredTokens.toString());

                assert.equal(event1[1].organization, unauthorizedMember, 'address does not match');
                assert.equal(event1[1].account, unauthorizedMember, 'address does not match');
                (event1[1].amount.toString()).should.be.equal(hundredTokens.toString());

                assert.equal(event1[2].organization, unauthorizedMember, 'address does not match');
                assert.equal(event1[2].account, unauthorizedMember, 'address does not match');
                (event1[2].amount.toString()).should.be.equal(hundredTokens.toString());
            });
        });
    });
});
