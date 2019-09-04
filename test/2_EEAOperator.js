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
        // For full testing, we set the same claim for the unauthorized account acting as its own delegate
        await etherDidInstance.addDelegate(unauthorizedMember, delegateType, unauthorizedMember, validity, {from: unauthorizedMember});
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

    describe('register Tokens', function () {
        describe('when an unauthorized user attempts to set token contracts ', function () {
            it('reverts', async function () {
                await expectThrow(eeaOperatorInstance.registerTokens(penaltyTokenAddress, rewardTokenAddress, reputationTokenAddress, {
                    from: unauthorizedMember
                }));
            });
        });
        describe('when the EEA admin sets token contracts', function () {
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
        });
    });

    describe('batch mint rewards', function () {
        const amountArray = [oneToken, oneToken, oneToken];
        const toArray = [employeeOrg1, employee2Org1, employeeOrg2];
        const orgArray = [organization1, organization1, organization2];
        describe('when the sender is the EEA issuer', function () {
            describe('When the recipients are EEA members', function () {
                describe('but the array lengths do not match', function () {
                    it('reverts', async function () {
                        await expectThrow(eeaOperatorInstance.batchMintRewards(orgArray, toArray, [oneToken, oneToken], {
                            from: eeaAdmin
                        }));
                    });
                });
                describe('but the organizations/employees are mismatched ', function () {
                    it('tokens are not mint but emit "EmployeeNotRegistered" & "BatchMintError" events', async function () {
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

                        const event1 = getEvents(tx, 'BatchMintError');
                        const event2 = getEvents(tx, 'EmployeeNotRegistered');

                        assert.equal(event1[0].organization, organization2, 'address does not match');
                        assert.equal(event1[0].account, employeeOrg1, 'address does not match');
                        (event1[0].amount.toString()).should.be.equal(oneToken.toString());

                        assert.equal(event1[1].organization, organization2, 'address does not match');
                        assert.equal(event1[1].account, employee2Org1, 'address does not match');
                        (event1[1].amount.toString()).should.be.equal(oneToken.toString());

                        assert.equal(event1[2].organization, organization1, 'address does not match');
                        assert.equal(event1[2].account, employeeOrg2, 'address does not match');
                        (event1[2].amount.toString()).should.be.equal(oneToken.toString());

                        assert.equal(event2[0].organization, organization2, 'address does not match');
                        assert.equal(event2[0].account, employeeOrg1, 'address does not match');

                        assert.equal(event2[1].organization, organization2, 'address does not match');
                        assert.equal(event2[1].account, employee2Org1, 'address does not match');

                        assert.equal(event2[2].organization, organization1, 'address does not match');
                        assert.equal(event2[2].account, employeeOrg2, 'address does not match');
                    });
                });
                describe('and reputation is minted for employees/organizations and rewards for organization', function () {
                    it('it succeeds', async function () {
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

                        assert.equal(employee1RepBal.toString(), oneToken.toString());
                        assert.equal(employee2RepBal.toString(), oneToken.toString());
                        assert.equal(employee3RepBal.toString(), oneToken.toString());
                        assert.equal(employee1RewardBal.toString(), zero.toString());
                        assert.equal(employee2RewardBal.toString(), zero.toString());
                        assert.equal(employee3RewardBal.toString(), zero.toString());
                        assert.equal(org1RepBal.toString(), '2000000000000000000');
                        assert.equal(org2RepBal.toString(), oneToken.toString());
                        assert.equal(org1RewardBal.toString(), '2000000000000000000');
                        assert.equal(org2RewardBal.toString(), oneToken.toString());
                    });
                    it('emits a "ReputationMinted" and "RewardsMinted" event', async function () {
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
            describe('when the recipients are not EEA member', function () {
                const toArray = [unauthorizedMember, unauthorizedMember, unauthorizedMember];
                const amountArray = [hundredTokens, hundredTokens, hundredTokens];
                const orgArray = [unauthorizedMember, unauthorizedMember, unauthorizedMember];
                it('does not mint tokens but emits "OrgNotMember" and "BatchMintError" event', async function () {
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

                    const event1 = getEvents(tx, 'BatchMintError');
                    const event2 = getEvents(tx, 'OrgNotMember');

                    assert.equal(event1[0].organization, unauthorizedMember, 'address does not match');
                    assert.equal(event1[0].account, unauthorizedMember, 'address does not match');
                    (event1[0].amount.toString()).should.be.equal(hundredTokens.toString());

                    assert.equal(event1[1].organization, unauthorizedMember, 'address does not match');
                    assert.equal(event1[1].account, unauthorizedMember, 'address does not match');
                    (event1[1].amount.toString()).should.be.equal(hundredTokens.toString());

                    assert.equal(event1[2].organization, unauthorizedMember, 'address does not match');
                    assert.equal(event1[2].account, unauthorizedMember, 'address does not match');
                    (event1[2].amount.toString()).should.be.equal(hundredTokens.toString());

                    assert.equal(event2[0].organization, unauthorizedMember, 'address does not match');
                    assert.equal(event2[1].organization, unauthorizedMember, 'address does not match');
                    assert.equal(event2[2].organization, unauthorizedMember, 'address does not match');
                });
            });
        });
        describe('when the sender is not the EEA issuer', function () {
            it('reverts', async function () {
                await expectThrow(eeaOperatorInstance.batchMintRewards(orgArray, toArray, amountArray, {
                    from: unauthorizedMember
                }));
            });
        });
    });

    describe('batch mint penalties', function () {
        const amountArray = [oneToken, oneToken, oneToken];
        const toArray = [employeeOrg1, employee2Org1, employeeOrg2];
        const orgArray = [organization1, organization1, organization2];
        describe('when the sender is the EEA issuer', function () {
            describe('When the recipients are EEA members', function () {
                describe('but the array lengths do not match', function () {
                    it('reverts', async function () {
                        await expectThrow(eeaOperatorInstance.batchMintPenalties(orgArray, toArray, [oneToken, oneToken], {
                            from: eeaAdmin
                        }));
                    });
                });
                describe('but issuer mismatches all the organizations/employees', function () {
                    it('reputation not burned, penalties not minted but emits "EmployeeNotRegistered" & "BatchMintError" event', async function () {
                        const bungledOrgArray = [organization2, organization2, organization1];
                        const oldBalance1 = await reputationTokenInstance.balanceOf(employeeOrg1);
                        const oldBalance2 = await reputationTokenInstance.balanceOf(employee2Org1);
                        const oldBalance3 = await reputationTokenInstance.balanceOf(employeeOrg2);
                        const tx = await eeaOperatorInstance.batchMintPenalties(bungledOrgArray, toArray, amountArray, {
                            from: eeaAdmin
                        });

                        const afterBalance1 = await reputationTokenInstance.balanceOf(employeeOrg1);
                        const afterBalance2 = await reputationTokenInstance.balanceOf(employee2Org1);
                        const afterBalance3 = await reputationTokenInstance.balanceOf(employeeOrg2);
                        (oldBalance1.toString()).should.be.equal(afterBalance1.toString());
                        (oldBalance2.toString()).should.be.equal(afterBalance2.toString());
                        (oldBalance3.toString()).should.be.equal(afterBalance3.toString());

                        // Test the event

                        const event1 = getEvents(tx, 'BatchMintError');
                        const event2 = getEvents(tx, 'EmployeeNotRegistered');

                        assert.equal(event1[0].organization, organization2, 'address does not match');
                        assert.equal(event1[0].account, employeeOrg1, 'address does not match');
                        (event1[0].amount.toString()).should.be.equal(oneToken.toString());

                        assert.equal(event1[1].organization, organization2, 'address does not match');
                        assert.equal(event1[1].account, employee2Org1, 'address does not match');
                        (event1[1].amount.toString()).should.be.equal(oneToken.toString());

                        assert.equal(event1[2].organization, organization1, 'address does not match');
                        assert.equal(event1[2].account, employeeOrg2, 'address does not match');
                        (event1[2].amount.toString()).should.be.equal(oneToken.toString());

                        assert.equal(event2[0].organization, organization2, 'address does not match');
                        assert.equal(event2[0].account, employeeOrg1, 'address does not match');

                        assert.equal(event2[1].organization, organization2, 'address does not match');
                        assert.equal(event2[1].account, employee2Org1, 'address does not match');

                        assert.equal(event2[2].organization, organization1, 'address does not match');
                        assert.equal(event2[2].account, employeeOrg2, 'address does not match');
                    });
                });
                describe('reputation burned from employees/organizations, penalties minted', function () {
                    it('it succeeds', async function () {
                        await eeaOperatorInstance.batchMintPenalties(orgArray, toArray, amountArray, {
                            from: eeaAdmin
                        });

                        const employee1RepBal = await reputationTokenInstance.balanceOf(employeeOrg1);
                        const employee2RepBal = await reputationTokenInstance.balanceOf(employee2Org1);
                        const employee3RepBal = await reputationTokenInstance.balanceOf(employeeOrg2);
                        const employee1PenaltyBal = await penaltyTokenInstance.balanceOf(employeeOrg1);
                        const employee2PenaltyBal = await penaltyTokenInstance.balanceOf(employee2Org1);
                        const employee3PenaltyBal = await penaltyTokenInstance.balanceOf(employeeOrg2);
                        const org1RepBal = await reputationTokenInstance.balanceOf(organization1);
                        const org2RepBal = await reputationTokenInstance.balanceOf(organization2);
                        const org1PenaltyBal = await penaltyTokenInstance.balanceOf(organization1);
                        const org2PenaltyBal = await penaltyTokenInstance.balanceOf(organization2);

                        assert.equal(employee1RepBal.toString(), '1000000000000000000');
                        assert.equal(employee2RepBal.toString(), '1000000000000000000');
                        assert.equal(employee3RepBal.toString(), '1000000000000000000');
                        assert.equal(employee1PenaltyBal.toString(), zero.toString());
                        assert.equal(employee2PenaltyBal.toString(), zero.toString());
                        assert.equal(employee3PenaltyBal.toString(), zero.toString());
                        assert.equal(org1RepBal.toString(), '2000000000000000000');
                        assert.equal(org2RepBal.toString(), '1000000000000000000');
                        assert.equal(org1PenaltyBal.toString(), '2000000000000000000');
                        assert.equal(org2PenaltyBal.toString(), '1000000000000000000');
                    });
                    it('emits a "ReputationBurned" and "PenaltiesMinted" event', async function () {
                        const tx = await eeaOperatorInstance.batchMintPenalties(orgArray, toArray, amountArray, {
                            from: eeaAdmin
                        });

                        // Test the event

                        const event1 = getEvents(tx, 'ReputationBurned');
                        const event2 = getEvents(tx, 'PenaltiesMinted');

                        assert.equal(event1[0].account, organization1, 'To address does not match');
                        (event1[0].amount.toString()).should.be.equal(oneToken.toString());

                        assert.equal(event1[1].account, employeeOrg1, 'To address does not match');
                        (event1[1].amount.toString()).should.be.equal(oneToken.toString());

                        assert.equal(event1[2].account, organization1, 'To address does not match');
                        (event1[2].amount.toString()).should.be.equal(oneToken.toString());

                        assert.equal(event1[3].account, employee2Org1, 'To address does not match');
                        (event1[3].amount.toString()).should.be.equal(oneToken.toString());

                        assert.equal(event1[4].account, organization2, 'To address does not match');
                        (event1[4].amount.toString()).should.be.equal(oneToken.toString());

                        assert.equal(event1[5].account, employeeOrg2, 'To address does not match');
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
                it('fails to burn reputation but emits "OrgNotMember" & "BatchMintError" event', async function () {
                    const oldRepBalance = await reputationTokenInstance.balanceOf(unauthorizedMember);
                    const oldPenaltiesBalance = await penaltyTokenInstance.balanceOf(unauthorizedMember);
                    const tx = await eeaOperatorInstance.batchMintPenalties(orgArray, toArray, amountArray, {
                        from: eeaAdmin
                    });

                    const newRepBalance = await reputationTokenInstance.balanceOf(unauthorizedMember);
                    const newPenaltyBalance = await penaltyTokenInstance.balanceOf(unauthorizedMember);

                    (oldRepBalance.toString()).should.be.equal(newRepBalance.toString());
                    (oldPenaltiesBalance.toString()).should.be.equal(newPenaltyBalance.toString());

                    // Test the event

                    const event1 = getEvents(tx, 'BatchMintError');
                    const event2 = getEvents(tx, 'OrgNotMember');

                    assert.equal(event1[0].organization, unauthorizedMember, 'address does not match');
                    assert.equal(event1[0].account, unauthorizedMember, 'address does not match');
                    (event1[0].amount.toString()).should.be.equal(hundredTokens.toString());

                    assert.equal(event1[1].organization, unauthorizedMember, 'address does not match');
                    assert.equal(event1[1].account, unauthorizedMember, 'address does not match');
                    (event1[1].amount.toString()).should.be.equal(hundredTokens.toString());

                    assert.equal(event1[2].organization, unauthorizedMember, 'address does not match');
                    assert.equal(event1[2].account, unauthorizedMember, 'address does not match');
                    (event1[2].amount.toString()).should.be.equal(hundredTokens.toString());

                    assert.equal(event2[0].organization, unauthorizedMember, 'address does not match');
                    assert.equal(event2[1].organization, unauthorizedMember, 'address does not match');
                    assert.equal(event2[2].organization, unauthorizedMember, 'address does not match');
                });
            });
        });
        describe('when the sender is not the EEA issuer', function () {
            it('reverts', async function () {
                await expectThrow(eeaOperatorInstance.batchMintPenalties(orgArray, toArray, amountArray, {
                    from: unauthorizedMember
                }));
            });
        });
    });

    describe('attempt burning more reputation than is available', function () {
        const to = employeeOrg2;
        const org = organization2;
        it('it successfully burns what is available', async function () {
            // We need to mint 1 token of reputation since balance is 0
            await eeaOperatorInstance.batchMintRewards([org], [to], [oneToken], {
                from: eeaAdmin
            });
            const oldRepBalanceEmployee = await reputationTokenInstance.balanceOf(to);
            const oldRepBalanceOrg = await reputationTokenInstance.balanceOf(org);
            // Attempt to burn 100 tokens
            const tx = await eeaOperatorInstance.batchMintPenalties([org], [to], [hundredTokens], {
                from: eeaAdmin
            });
            const newRepBalEmployee = await reputationTokenInstance.balanceOf(to);
            const newRepBalOrg = await reputationTokenInstance.balanceOf(org);

            (oldRepBalanceEmployee.toString()).should.be.equal(oneToken.toString());
            (oldRepBalanceOrg.toString()).should.be.equal(oneToken.toString());
            (newRepBalEmployee.toString()).should.be.equal(zero.toString());
            (newRepBalOrg.toString()).should.be.equal(zero.toString());

            // Test the event

            const event1 = getEvents(tx, 'ReputationBurned');
            const event2 = getEvents(tx, 'PenaltiesMinted');

            assert.equal(event1[0].account, org, 'To address does not match');
            (event1[0].amount.toString()).should.be.equal(oneToken.toString());

            assert.equal(event1[1].account, to, 'To address does not match');
            (event1[1].amount.toString()).should.be.equal(oneToken.toString());

            assert.equal(event2[0].account, org, 'To address does not match');
            (event2[0].amount.toString()).should.be.equal(hundredTokens.toString());
        });
    });
    describe('burnPenalties', function () {
        const org = organization1;
        const amount = oneToken;
        describe('when the burner is the EEA admin', function () {
            describe('burns penalties', function () {
                it('it succeeds', async function () {
                    const oldBalance = await penaltyTokenInstance.balanceOf(org);
                    await eeaOperatorInstance.burnPenalties(org, amount, '0x0', {
                        from: eeaAdmin
                    });
                    const newBalance = await penaltyTokenInstance.balanceOf(org);
                    ((oldBalance.sub(oneToken)).toString()).should.be.equal(newBalance.toString());
                });
                it('emits a "PenaltiesBurned" event', async function () {
                    const tx = await eeaOperatorInstance.burnPenalties(org, amount, '0x0', {
                        from: eeaAdmin
                    });
                    // Test the event

                    const event1 = getEvents(tx, 'PenaltiesBurned');

                    assert.equal(event1[0].account, org, 'To address does not match');
                    (event1[0].amount.toString()).should.be.equal(amount.toString());
                    assert.equal(event1[0].operatorData, '0x00', 'Data does not match');
                });
            });
        });
        describe('when the burner is not the EEA admin', function () {
            it('reverts', async function () {
                await expectThrow(eeaOperatorInstance.burnPenalties(org, amount, '0x0', {
                    from: unauthorizedMember
                }));
            });
        });
    });
    describe('burnRewards', function () {
        const org = organization1;
        const amount = hundredTokens;
        describe('when the burner is the EEA admin', function () {
            describe('burns rewards', function () {
                it('it succeeds', async function () {
                    // Mint enough rewards to burn
                    await eeaOperatorInstance.batchMintRewards([org], [employeeOrg1], [hundredTokens], {
                        from: eeaAdmin
                    });

                    const oldBalance = await rewardTokenInstance.balanceOf(org);
                    await eeaOperatorInstance.burnRewards(org, amount, '0x0', {
                        from: eeaAdmin
                    });
                    const newBalance = await rewardTokenInstance.balanceOf(org);
                    ((oldBalance.sub(hundredTokens)).toString()).should.be.equal(newBalance.toString());
                });
                it('emits a "RewardsBurned" event', async function () {
                    const tx = await eeaOperatorInstance.burnRewards(org, oneToken, '0x0', {
                        from: eeaAdmin
                    });
                    // Test the event

                    const event1 = getEvents(tx, 'RewardsBurned');

                    assert.equal(event1[0].account, org, 'To address does not match');
                    (event1[0].amount.toString()).should.be.equal(oneToken.toString());
                    assert.equal(event1[0].operatorData, '0x00', 'Data does not match');
                });
            });
        });
        describe('when the burner is not the EEA admin', function () {
            it('reverts', async function () {
                await expectThrow(eeaOperatorInstance.burnPenalties(org, amount, '0x0', {
                    from: unauthorizedMember
                }));
            });
        });
    });

    describe('burnAll', function () {
        describe('when the burner is not the EEA admin', function () {
            it('reverts', async function () {
                await expectThrow(eeaOperatorInstance.burnAll(organization1, {
                    from: unauthorizedMember
                }));
            });
        });
        describe('when the burner is the EEA admin', function () {
            describe('burns all rewards/penalty tokens', function () {
                it('it succeeds', async function () {
                    const org = organization1;
                    await eeaOperatorInstance.burnAll(org, {
                        from: eeaAdmin
                    });
                    const newRewardBalance = await rewardTokenInstance.balanceOf(org);
                    const newPenaltyBalance = await penaltyTokenInstance.balanceOf(org);

                    (newRewardBalance.toString()).should.be.equal(zero.toString());
                    (newPenaltyBalance.toString()).should.be.equal(zero.toString());
                });
                it('emits a "PenaltiesBurned" and "RewardsBurned" event', async function () {
                    const org = organization2;
                    const rewardBalance = await rewardTokenInstance.balanceOf(org);
                    const penaltyBalance = await penaltyTokenInstance.balanceOf(org);
                    const tx = await eeaOperatorInstance.burnAll(org, {
                        from: eeaAdmin
                    });
                    // Test the event

                    const event1 = getEvents(tx, 'RewardsBurned');
                    const event2 = getEvents(tx, 'PenaltiesBurned');

                    assert.equal(event1[0].account, org, 'To address does not match');
                    (event1[0].amount.toString()).should.be.equal(rewardBalance.toString());

                    assert.equal(event2[0].account, org, 'To address does not match');
                    (event2[0].amount.toString()).should.be.equal(penaltyBalance.toString());
                });
            });
        });
    });




});
