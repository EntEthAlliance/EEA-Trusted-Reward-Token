/**
* @title EEA Token
* @version 1.0
* @author Mike Alonso
*/

import {BigNumber, getEvents} from './helpers/tools.js';
import expectThrow from './helpers/expectThrow.js';
import { on } from 'cluster';

const EEAClaimsIssuer = artifacts.require('../contracts/EEAClaimsIssuer.sol');
const EthereumClaimsRegistry = artifacts.require('../contracts/EthereumClaimsRegistry.sol');
const {singletons} = require('../node_modules/openzeppelin-test-helpers');

const should = require('chai') // eslint-disable-line
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('EEAClaimsIssuer', (accounts) => {
    const eeaAdmin                  = accounts[0];
    const organization1             = accounts[1];
    const organization2             = accounts[2];
    const unauthorizedMember        = accounts[3];

    // eslint-disable-next-line new-cap

    const membershipClaim = '0xe4d89b09a6eb94125ee9c6123f55fbaef99eabb81fcefd76640abb9269a84805'; // keccak256(membership)
    const claimValue = '0x6273151f959616268004b58dbb21e5c851b7b8d04498b4aabee12291d22fc034'; // keccak256(true)
    const secondClaimType = '0x7f875d05930cfcded4b77e6b7631b9ad1cd35cb8da0168123ec68b590c823f70'; // keccak256(digital identity tsk force)
    const secondClaimValue = '0x14ceb1149cdab84b395151a21d3de6707dd76fff3e7bc4e018925a9986b7f72f'; // keccak256(member)
    // Deploy 1820 contract to network to register ERC777 interfaces

    before(async () => {
        // eslint-disable-next-line new-cap
        await singletons.ERC1820Registry(eeaAdmin);
    });

    // Set up instances and their addresses
    let claimsRegInstance;
    let eeaIssuerInstance;
    let claimsRegAddress;
    let eeaIssuerAddress;

    // Deploy Ether Claims Registry

    before(async () => {
        claimsRegInstance = await EthereumClaimsRegistry.new();
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
            describe('set a membership claim for an organization', function () {
                it('succeeds', async function () {
                    await eeaIssuerInstance.setMembershipClaim(org1, {
                        from: eeaAdmin
                    });

                    const claim = await claimsRegInstance.getClaim(eeaIssuerAddress, org1, membershipClaim);

                    assert.equal(claim, claimValue);
                });
                it('and emits a "MemberShipAdded"  event', async function () {
                    const tx = await eeaIssuerInstance.setMembershipClaim(org2, {
                        from: eeaAdmin
                    });
                    // Test the event

                    const event1 = getEvents(tx, 'MemberShipAdded');

                    assert.equal(event1[0].issuer, eeaAdmin, 'Msg.sender address does not match');
                    assert.equal(event1[0].subject, org2, 'addres does not match');
                });
            });
        });
        describe('when the sender is not the eea admin', function () {
            it('reverts', async function () {
                await expectThrow(eeaIssuerInstance.setMembershipClaim(unauthorizedMember, {
                    from: unauthorizedMember
                }));
            });
        });
    });

    describe('revoke Membership', function () {
        const org1 = organization1;
        const org2 = organization2;
        describe('when the sender is the EEA Issuer', function () {
            describe('revokes a membership claim from an organization', function () {
                it('succeeds', async function () {
                    await eeaIssuerInstance.revokeMembership(org1, {
                        from: eeaAdmin
                    });

                    const claim = await claimsRegInstance.getClaim(eeaIssuerAddress, org1, membershipClaim);

                    claim.should.not.be.equal(claimValue);
                });
                it('and emits a "MembershipRevoked"  event', async function () {
                    const tx = await eeaIssuerInstance.revokeMembership(org2, {
                        from: eeaAdmin
                    });
                    // Test the event

                    const event1 = getEvents(tx, 'MembershipRevoked');

                    assert.equal(event1[0].issuer, eeaAdmin, 'Msg.sender address does not match');
                    assert.equal(event1[0].subject, org2, 'addres does not match');

                    // Set claims for next test
                    await eeaIssuerInstance.setMembershipClaim(org1, {
                        from: eeaAdmin
                    });
                });
            });
        });
        describe('when the sender is not the eea admin', function () {
            it('reverts', async function () {
                await expectThrow(eeaIssuerInstance.revokeMembership(org1, {
                    from: unauthorizedMember
                }));
            });
        });
    });

    describe('setClaim', function () {
        const org1 = organization1;
        const org2 = organization2;
        describe('when the sender is the EEA Issuer', function () {
            describe('set a claim that a member is part of the identity task force', function () {
                it('succeeds', async function () {
                    await eeaIssuerInstance.setClaim(org1, secondClaimType, secondClaimValue, {
                        from: eeaAdmin
                    });

                    const claim = await claimsRegInstance.getClaim(eeaIssuerAddress, org1, secondClaimType);

                    assert.equal(claim, secondClaimValue);
                });
                it('and emits a "ClaimAdded"  event', async function () {
                    const tx = await eeaIssuerInstance.setClaim(org2, secondClaimType, secondClaimValue, {
                        from: eeaAdmin
                    });
                    // Test the event

                    const event1 = getEvents(tx, 'ClaimAdded');

                    assert.equal(event1[0].issuer, eeaAdmin, 'Msg.sender address does not match');
                    assert.equal(event1[0].subject, org2, 'addres does not match');
                    assert.equal(event1[0].key, secondClaimType, 'claim type does not match');
                    assert.equal(event1[0].value, secondClaimValue, 'value does not match');
                });
            });
        });
        describe('when the sender is not the eea admin', function () {
            it('reverts', async function () {
                await expectThrow(eeaIssuerInstance.setClaim(unauthorizedMember, secondClaimType, secondClaimValue, {
                    from: unauthorizedMember
                }));
            });
        });
    });

    describe('removeClaim', function () {
        const org1 = organization1;
        const org2 = organization2;
        describe('when the sender is the EEA Issuer', function () {
            describe('remove claim that organization is part of the identity task force', function () {
                it('succeeds', async function () {
                    await eeaIssuerInstance.removeClaim(org1, secondClaimType, {
                        from: eeaAdmin
                    });

                    const claim = await claimsRegInstance.getClaim(eeaIssuerAddress, org1, secondClaimType);

                    claim.should.not.be.equal(secondClaimValue);
                });
                it('and emits a "ClaimRemoved"  event', async function () {
                    const tx = await eeaIssuerInstance.removeClaim(org2, secondClaimType, {
                        from: eeaAdmin
                    });
                    // Test the event

                    const event1 = getEvents(tx, 'ClaimRemoved');

                    assert.equal(event1[1].issuer, eeaAdmin, 'Msg.sender address does not match');
                    assert.equal(event1[1].subject, org2, 'addres does not match');
                    assert.equal(event1[1].key, secondClaimType, 'claim type does not match');

                    // Set claim for test
                    await eeaIssuerInstance.setClaim(org1, secondClaimType, secondClaimValue, {
                        from: eeaAdmin
                    });
                });
            });
        });
        describe('when the sender is not the eea admin', function () {
            it('reverts', async function () {
                await expectThrow(eeaIssuerInstance.removeClaim(org1, secondClaimType, {
                    from: unauthorizedMember
                }));
            });
        });
    });
});
