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

}
