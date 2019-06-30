pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC777/ERC777.sol";


/**
 * @title EEA Reward Token
 */
contract RewardToken is ERC777 {

    /**
     * @dev Constructor that sets default operators.
     */
    constructor(address[] memory defaultOperators) public ERC777("RewardToken", "EEAR", defaultOperators) {
    }

    function addRewards(uint256 amount, address member) public {
       require(isOperatorFor(msg.sender, member), "Is not an authorized operator for member account");
      _mint(msg.sender, member, amount * 10 ** decimals(), "", "");
    }
}
