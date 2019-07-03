pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./RewardToken.sol";
import "./PenaltyToken.sol";
import "./ReputationToken.sol";

/**
 * @title EEA Operator contract
 */
contract EEAOperator is Ownable {

  PenaltyToken public penaltyToken;
  RewardToken public rewardToken;
  ReputationToken public reputationToken;

  uint256 public penaltiesToReputation;
  uint256 public rewardsToReputation;


  event RewardsMinted(
      address indexed account,
      uint256 amount,
      bytes data,
      bytes operatorData
  );

  event PenaltiesMinted(
      address indexed account,
      uint256 amount,
      bytes data,
      bytes operatorData
  );

  event PenaltiesBurned(
    address indexed account,
    uint256 amount
  );

  event RewardsBurned(
    address indexed account,
    uint256 amount
  );

  event AllTokensBurned(address indexed account);

  constructor(uint256 _penaltiesToReputation, uint256 _rewardsToReputation) public {
    address[] memory defaultOperators = new address[](2);
    defaultOperators[0] = address(this);
    defaultOperators[1] = address(msg.sender);

    //set indexes for reputation tokens calculation
    penaltiesToReputation = _penaltiesToReputation;
    rewardsToReputation = _rewardsToReputation;

    //Create token smart contracts;
    penaltyToken = new PenaltyToken(defaultOperators);
    rewardToken = new RewardToken(defaultOperators);
    reputationToken = new ReputationToken(defaultOperators);
  }

  function mintRewards(address account, uint256 amount)
    external
    onlyOwner
 {
   rewardToken.operatorMint(account, amount, '', '');

   emit RewardsMinted(account, amount, '', '');
 }

 function mintPenalties(address account, uint256 amount)
   external
   onlyOwner
 {
   penaltyToken.operatorMint(account, amount, '', '');

   emit PenaltiesMinted(account, amount, '', '');
 }

 function balance(address account)
   external
   view
   returns (uint256, uint256)
 {
   return (rewardToken.balanceOf(account), penaltyToken.balanceOf(account));
 }

 function burnPenalties(address account, uint256 amount)
   public
   onlyOwner
 {
   penaltyToken.operatorBurn(account, amount, '', '');

   emit PenaltiesBurned(account, amount);
 }

 function burnRewards(address account, uint256 amount)
   public
   onlyOwner
 {
   rewardToken.operatorBurn(account, amount, '', '');

   emit RewardsBurned(account, amount);
 }

 function burnAllTokens(address account)
   external
   onlyOwner
 {
   burnPenalties(account, penaltyToken.balanceOf(account));
   burnRewards(account, rewardToken.balanceOf(account));

   emit AllTokensBurned(account);
 }

}
