/**
* @title EEA Token
* @version 1.0
* @author Mike Alonso
*/

import {BigNumber, getEvents} from './helpers/tools.js';
import expectThrow from './helpers/expectThrow.js';

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
    const organiztion1              = accounts[1];
    const employeeOrg1              = accounts[2];
    const organization2             = accounts[3];
    const employeeOrg2              = accounts[4];
    const unauthorizedMember        = accounts[5];

    const zeroAddress = BigNumber(0);
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
        await eeaIssuerInstance.setMembershipClaim(organiztion1, {from: eeaAdmin});
        await eeaIssuerInstance.setMembershipClaim(organization2, {from: eeaAdmin});
    });

    // Each Organization claim employees as delegates through DID registry

    before(async () => {
    // Delegate type = keccak256("employee")
        const delegateType = '0x863480501959a73cc3fea35fb3cf3402b6489ac34f0a59336a628ff703cd693e';
        const validity = 1000000;
        await etherDidInstance.addDelegate(organiztion1, delegateType, employeeOrg1, validity, {from: organiztion1});
        await etherDidInstance.addDelegate(organization2, delegateType, employeeOrg2, validity, {from: organization2});
    });

    it('should instantiate tokens', async () => {
        assert.not.equal(reputationTokenAddress, zeroAddress, 'Token not deployed');
        assert.not.equal(rewardTokenAddress, zeroAddress, 'Token not deployed');
        assert.not.equal(penaltyTokenAddress, zeroAddress, 'Token not deployed');
    });

    it('operator contract insantiated correctly', async () => {
        const setPenaltyTokenAdd = await eeaOperatorInstance.penaltyToken();
        const setReputationTokenAdd = await eeaOperatorInstance.reputationToken();
        const setRewardsTokenAdd = await eeaOperatorInstance.rewardToken();
        const setDidReg = await eeaOperatorInstance.didRegistry();
        const setClaimReg = await eeaOperatorInstance.claimsRegistry();
        const setIssuer = await eeaOperatorInstance.eeaIssuer();
        const owner = await eeaOperatorInstance.owner();

        expect(setPenaltyTokenAdd).equal(zeroAddress);
        expect(setReputationTokenAdd).equal(zeroAddress);
        expect(setRewardsTokenAdd).equal(zeroAddress);
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
        expect(setPenaltyTokenAdd).equal(zeroAddress);
        expect(setReputationTokenAdd).equal(zeroAddress);
        expect(setRewardsTokenAdd).equal(zeroAddress);
    });

    describe('mint rewards', function () {
        describe('when the recipient is an EEA member', function () {
            const to = employeeOrg1;
            const amount = hundredTokens;
            const org = organiztion1;
            describe('when the sender is not the EEA issuer', function () {
                it('reverts', async function () {
                    await expectThrow(eeaOperatorInstance.mintRewards(org, to, amount, 0x0, {
                        from: unauthorizedMember
                    }));
                });
            });
            describe('when the sender is the EEA issuer, but sets the wrong organization', function () {
                it('reverts', async function () {
                    await expectThrow(eeaOperatorInstance.mintRewards(organization2, to, amount, 0x0, {
                        from: eeaAdmin
                    }));
                });
            });
            describe('when the sender is the EEA issuer', function () {
                it('mints reputation for employee/organization and rewards for organization', async function () {
                    await eeaOperatorInstance.mintRewards(org, to, amount, 0x0, {
                        from: eeaAdmin
                    });
                    const memberBalanceRep = await reputationTokenInstance.balanceOf(to);
                    const memberBalanceRewards = await rewardTokenInstance.balanceOf(to);
                    const orgBalanceRep = await reputationTokenInstance.balanceOf(org);
                    const orgBalanceRewards = await rewardTokenInstance.balanceOf(org);

                    memberBalanceRep.should.be.bignumber.equal(amount);
                    memberBalanceRewards.should.be.bignumber.equal(zero);
                    orgBalanceRep.should.be.bignumber.equal(amount);
                    orgBalanceRewards.should.be.bignumber.equal(amount);
                });
                it('emits a transfer event', async function () {
                    const tx = await eeaOperatorInstance.mintRewards(org, to, amount, 0x0, {
                        from: eeaAdmin
                    });
                    // Test the event

                    const event1 = getEvents(tx, 'ReputationMinted');
                    const event2 = getEvents(tx, 'RewardsMinted');

                    assert.equal(event1[0].account, to, 'To address does not match');
                    (events[0].amount).should.be.bignumber.equal(amount);
                    assert.equal(event1[0].operatorData, 0x0, 'Data does not match');

                    assert.equal(event1[1].account, org, 'To address does not match');
                    (event1[1].amount).should.be.bignumber.equal(amount);
                    assert.equal(event1[1].operatorData, 0x0, 'Data does not match');

                    assert.equal(event2[0].account, org, 'To address does not match');
                    (event2[0].amount).should.be.bignumber.equal(amount);
                    assert.equal(event2[0].operatorData, 0x0, 'Data does not match');
                });
            });
        });
        describe('when the recipient is not an EEA member', function () {
            const to = unauthorizedMember;
            it('reverts', async function () {
                await expectThrow(eeaOperatorInstance.mintRewards(to, to, amount, 0x0, {
                    from: eeaAdmin
                }));
            });
        });
        describe('when the recipient is the zero address', function () {
            const to = zeroAddress;
            it('reverts', async function () {
                await expectThrow(eeaOperatorInstance.mintRewards(organiztion1, to, amount, 0x0, {
                    from: eeaAdmin
                }));
            });
        });
    });

/*

    await catchRevert(penaltyToken.transfer(member2, 2, {from: member1}), 'revert You cannot transfer penalties');
    await catchRevert(penaltyToken.send(member2, 2, '0x0', {from: member1}), 'revert You cannot transfer penalties');
    await catchRevert(penaltyToken.transferFrom(member1, member2, 2, {from: member1}), 'revert You cannot transfer penalties');
    await catchRevert(penaltyToken.approve(member2, 2, {from: member1}), 'revert You cannot transfer penalties');
    await catchRevert(penaltyToken.burn(2, '0x0', {from: member1}), 'revert You cannot burn penalties');
    await catchRevert(penaltyToken.authorizeOperator(member3, {from: member1}), 'You cannot change operators of penalties');
    await catchRevert(penaltyToken.revokeOperator(member3, {from: member1}), 'You cannot change operators of penalties');
  });

  it("check that balance sensitive methods are disabled for Reputation token", async () => {
    await operator.mintRewards(member1, 10, '0x0');
    await catchRevert(reputationToken.transfer(member2, 2, {from: member1}), 'revert You cannot transfer penalties');
    await catchRevert(reputationToken.send(member2, 2, '0x0', {from: member1}), 'revert You cannot transfer penalties');
    await catchRevert(reputationToken.transferFrom(member1, member2, 2, {from: member1}), 'revert You cannot transfer penalties');
    await catchRevert(reputationToken.approve(member2, 2, {from: member1}), 'revert You cannot transfer penalties');
    await catchRevert(reputationToken.burn(2, '0x0', {from: member1}), 'revert You cannot burn penalties');
    await catchRevert(reputationToken.authorizeOperator(member3, {from: member1}), 'You cannot change operators of penalties');
    await catchRevert(reputationToken.revokeOperator(member3, {from: member1}), 'You cannot change operators of penalties');
  });


  describe('transfer', function () {
    describe('when the recipient is not the zero address', function () {
        const to = tokenHolder1;
        describe('when the sender does not have enough balance', function () {
            const transferAmount = halfTokens.add(1);
            it('reverts', async function () {
                await expectThrow(ERC20StandardMBInstance.transfer(to, transferAmount, {
                    from: owner
                }));
            });
        });
        describe('when the sender has enough balance', function () {
            const transferAmount = new BigNumber(500 * 1e18);
            it('transfers the requested amount', async function () {
                await ERC20StandardMBInstance.transfer(to, transferAmount, {
                    from: owner
                });
                const senderBalance = await ERC20StandardMBInstance.balanceOf(owner);
                senderBalance.should.be.bignumber.equal(halfTokens.sub(transferAmount));
                const recipientBalance = await ERC20StandardMBInstance.balanceOf(to);
                recipientBalance.should.be.bignumber.equal(transferAmount);
            });
            it('emits a transfer event', async function () {
                const tx = await ERC20StandardMBInstance.transfer(to, transferAmount, {
                    from: owner
                });
                // Test the event

                const events = getEvents(tx, 'Transfer');

                assert.equal(events[0].from, owner, 'From address does not match');
                assert.equal(events[0].to, to, 'To address does not match');
                (events[0].value).should.be.bignumber.equal(transferAmount);
            });
        });
    });
    describe('when the recipient is the zero address', function () {
        const to = zeroAddress;
        it('reverts', async function () {
            await expectThrow(ERC20StandardMBInstance.transfer(to, 100, {
                from: owner
            }));
        });
    });
});
*/
});
