const EEAOperator = artifacts.require('./EEAOperator.sol');
const RewardToken = artifacts.require('./RewardToken.sol');
const PenaltyToken = artifacts.require('./PenaltyToken.sol');
const ReputationToken = artifacts.require('./ReputationToken.sol');

async function catchRevert(promise, message) {
    try {
        await promise;
        throw null;
    }
    catch (error) {
      assert(error.message.includes(message));
    }
};

contract('EEAOperator', function(accounts) {

  const zeroAddress = '0x0000000000000000000000000000000000000000';

  beforeEach("should prepare", async () => {
    assert.isAtLeast(accounts.length, 4);

    //eea roles
    this.eeaAdmin = accounts[0];
    this.member1 = accounts[1];
    this.member2 = accounts[2];
    this.member3 = accounts[3];


    //init eea operator
    this.operator = await EEAOperator.new(1, 1);


    //token instances
    this.rewardToken = await RewardToken.new([this.operator.address]);
    this.penaltyToken = await PenaltyToken.new([this.operator.address]);
    this.reputationToken = await ReputationToken.new([this.operator.address]);

    this.operator.registerTokens(penaltyToken.address, rewardToken.address, reputationToken.address);
  })

  it("check that tokens are initiated", async () => {
    let rewardTokenAddress = await operator.rewardToken();
    let penaltyTokenAddress = await operator.penaltyToken();
    let reputationTokenAddress = await operator.reputationToken();
    expect(rewardTokenAddress).not.equal(zeroAddress);
    expect(penaltyTokenAddress).not.equal(zeroAddress);
    expect(reputationTokenAddress).not.equal(zeroAddress);
  })

  it("check minting of rewards, penalties and reputation", async () => {
    //Mint rewards checks
    let rewardsBalance1 = await rewardToken.balanceOf(member1);
    let reputationBalance1 = await reputationToken.balanceOf(member1);
    let rewardsAmount = 10;
    expect(rewardsBalance1.toNumber()).equal(0);
    await operator.mintRewards(member1, rewardsAmount, '0x0');
    let rewardsBalance2 = await rewardToken.balanceOf(member1);
    let reputationBalance2 = await reputationToken.balanceOf(member1);
    expect(rewardsBalance2.toNumber()).equal(rewardsBalance1.toNumber() + rewardsAmount);
    expect(reputationBalance2.toNumber()).equal(reputationBalance1.toNumber() + (await operator.rewardsToReputation()) * rewardsAmount);

    //Mint penalties
    let penaltiesBalance1 = await penaltyToken.balanceOf(member1);
    let penaltiesAmount = 10;
    expect(penaltiesBalance1.toNumber()).equal(0);
    await operator.mintPenalties(member1, penaltiesAmount, '0x0');
    let penaltiesBalance2 = await penaltyToken.balanceOf(member1);
    let reputationBalance3 = await reputationToken.balanceOf(member1);
    expect(penaltiesBalance2.toNumber()).equal(penaltiesBalance1.toNumber() + penaltiesAmount);
    expect(reputationBalance3.toNumber()).equal(reputationBalance2.toNumber() - (await operator.penaltiesToReputation()) * penaltiesAmount);
  })


  it("check that balance sensitive methods are disabled for Penalty token", async () => {
    await operator.mintPenalties(member1, 10, '0x0');
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

})
