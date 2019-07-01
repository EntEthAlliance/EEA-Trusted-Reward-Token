const EEAOperator = artifacts.require('./EEAOperator.sol');
const RewardToken = artifacts.require('./RewardToken.sol');
const PenaltyToken = artifacts.require('./PenaltyToken.sol');

contract('EEAOperator', function(accounts) {

  const zeroAddress = '0x0000000000000000000000000000000000000000';

  beforeEach("should prepare", async () => {
    assert.isAtLeast(accounts.length, 3);

    //eea roles
    this.eeaAdmin = accounts[0];
    this.member1 = accounts[1];
    this.member2 = accounts[2];

    //init eea operator
    this.operator = await EEAOperator.new();

    //token instances
    this.rewardToken = await RewardToken.at(await operator.rewardToken());
    this.penaltyToken = await PenaltyToken.at(await operator.penaltyToken());
  })

  it("check that tokens are initiated", async () => {
    let rewardTokenAddress = await operator.rewardToken();
    let penaltyTokenAddress = await operator.penaltyToken();
    expect(rewardTokenAddress).not.equal(zeroAddress);
    expect(penaltyTokenAddress).not.equal(zeroAddress);
  })

  it("check that minting of rewards and penalties works", async () => {
    let rewardsBalance1 = await rewardToken.balanceOf(member1);
    let rewardsAmount = 10;
    expect(rewardsBalance1.toNumber()).equal(0);
    await operator.addRewards(member1, rewardsAmount);
    let rewardsBalance2 = await rewardToken.balanceOf(member1);
    expect(rewardsBalance2.toNumber()).equal(rewardsBalance1.toNumber() + rewardsAmount);
  })



})
