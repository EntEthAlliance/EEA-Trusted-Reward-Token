pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "./RewardToken.sol";
import "./PenaltyToken.sol";
import "./ReputationToken.sol";

/**
 * @title EEA Operator contract
 */
contract EEAOperator is Ownable {
  using SafeMath for uint256;

  PenaltyToken public penaltyToken;
  RewardToken public rewardToken;
  ReputationToken public reputationToken;

  uint256 public penaltiesToReputation;
  uint256 public rewardsToReputation;


  event RewardsMinted(
      address indexed account,
      uint256 amount,
      bytes operatorData
  );

  event PenaltiesMinted(
      address indexed account,
      uint256 amount,
      bytes operatorData
  );

  event ReputationMinted(
      address indexed account,
      uint256 amount,
      bytes operatorData
  );

  event PenaltiesBurned(
    address indexed account,
    uint256 amount,
    bytes operatorData
  );

  event RewardsBurned(
    address indexed account,
    uint256 amount,
    bytes operatorData
  );

  event ReputationBurned(
    address indexed account,
    uint256 amount,
    bytes operatorData
  );

  constructor(uint256 _penaltiesToReputation, uint256 _rewardsToReputation) public {
    //set indexes for reputation tokens calculation
    penaltiesToReputation = _penaltiesToReputation;
    rewardsToReputation = _rewardsToReputation;
  }

  function registerTokens(address _penaltyToken, address _rewardToken, address _reputationToken)
    external
    onlyOwner
  {
    penaltyToken = PenaltyToken(_penaltyToken);
    rewardToken = RewardToken(_rewardToken);
    reputationToken = ReputationToken(_reputationToken);
  }

  function mintRewards(address account, uint256 amount, bytes calldata operatorData)
    external
    onlyOwner
 {
   rewardToken.operatorMint(account, amount, '', operatorData);
   reputationToken.operatorMint(account, rewardsToReputation.mul(amount), '', operatorData);
   // Emit events
   emit RewardsMinted(account, amount, operatorData);
   emit ReputationMinted(account, amount, operatorData);
 }

 function mintPenalties(address account, uint256 amount, bytes calldata operatorData)
   external
   onlyOwner
 {
   penaltyToken.operatorMint(account, amount, '', operatorData);

   // Update reputation balance
   uint256 reputationFee = penaltiesToReputation.mul(amount);
   uint256 reputationBalance = reputationToken.balanceOf(account);
   uint256 reputationPenalty = reputationFee > reputationBalance ? reputationBalance : reputationFee;
   reputationToken.operatorBurn(account, reputationPenalty, '', operatorData);
   //Emit events
   emit PenaltiesMinted(account, amount, operatorData);
   emit ReputationBurned(account, reputationPenalty, operatorData);
 }

 function burnPenalties(address account, uint256 amount, bytes memory operatorData)
   public
   onlyOwner
 {
   penaltyToken.operatorBurn(account, amount, '', operatorData);
   emit PenaltiesBurned(account, amount, operatorData);
 }

 function burnRewards(address account, uint256 amount, bytes memory operatorData)
   public
   onlyOwner
 {
   rewardToken.operatorBurn(account, amount, '', operatorData);
   emit RewardsBurned(account, amount, operatorData);
 }

 /// At the end of membership year EEA secretary can burn all tokens using them towards membership fee or credits
 /// Reputation tokens stay intact
 function burnAll(address account)
   external
   onlyOwner
 {
   burnPenalties(account, penaltyToken.balanceOf(account), 'membership renewal');
   burnRewards(account, rewardToken.balanceOf(account), 'membership renewal');
 }

 function balance(address account)
   external
   view
   returns (uint256, uint256, uint256)
 {
   return (rewardToken.balanceOf(account), penaltyToken.balanceOf(account), reputationToken.balanceOf(account));
 }

}
