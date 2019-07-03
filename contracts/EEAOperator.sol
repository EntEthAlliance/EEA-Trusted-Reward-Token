pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./RewardToken.sol";
import "./PenaltyToken.sol";

/**
 * @title EEA Operator contract
 */
contract EEAOperator is Ownable {

  PenaltyToken public penaltyToken;
  RewardToken public rewardToken;

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

  constructor() public {
    address[] memory defaultOperators = new address[](2);
    defaultOperators[0] = address(this);
    defaultOperators[1] = address(msg.sender);

    //Create token smart contracts;
    penaltyToken = new PenaltyToken(defaultOperators);
    rewardToken = new RewardToken(defaultOperators);
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
