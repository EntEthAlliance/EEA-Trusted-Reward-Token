pragma solidity ^0.5.0;

import "node_modules/openzeppelin-solidity/contracts/token/ERC777/ERC777.sol";


/**
 * @title EEA Reward Token
 */
contract RewardToken is ERC777 {

    /**
     * @dev Constructor that sets default operators.
     */
    constructor(address[] memory defaultOperators) public ERC777("RewardToken", "EEART", defaultOperators) {
    }

    /**
     * @dev Similar to operator burn, see `IERC777.operatorBurn`.
     *
     * Emits `Minted` and `Transfer` events.
     */
    function operatorMint(address account, uint256 amount, bytes calldata data, bytes calldata operatorData) external {
       require(msg.sender != account, "Error: caller cannot be holder");
       require(isOperatorFor(msg.sender, account), "ERC777: caller is not an operator for holder");
      _mint(msg.sender, account, amount, data, operatorData);
    }
}
