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
   rewardToken.operatorMint(account, amount, 'rewards', 'rewards');
   //TODO - emit an event here
 }

 function mintPenalties(address account, uint amount)
   external
   onlyOwner
 {
   penaltyToken.operatorMint(account, amount, 'penalties', 'penalties');
    //TODO - emit an event here
 }


}
