pragma solidity ^0.5.0;

import "./ModifiedERC777.sol";
import "./EEATransferableToken.sol";


/**
 * @title EEA Reward Token
 */
contract RewardToken is ModifiedERC777, EEATransferableToken {

    /**
     * @dev Constructor that sets default operators.
     */
    constructor(address[] memory defaultOperators, address _didRegistry, address _claimsRegistry, address _eeaIssuer)
    public ModifiedERC777("RewardToken", "EEART", defaultOperators) EEATransferableToken( _didRegistry, _claimsRegistry, _eeaIssuer){
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

    /// RESTRICTED METHODS BETWEEN EEA MEMBERS ONLY



    function send(address recipient, uint256 amount, bytes calldata data) external {
        require (_memberCheck(recipient), "Error: Not EEA member");
        _send(msg.sender, msg.sender, recipient, amount, data, "", true);
    }


    function transfer(address recipient, uint256 amount) public returns (bool) {
        require (_memberCheck(recipient), "Error: Not EEA member");
        super.transfer(recipient, amount);
    }



    function transferFrom(address holder, address recipient, uint256 amount) public returns (bool) {
        require (_memberCheck(recipient), "Error: Not EEA member");
        super.transferFrom(holder, recipient, amount);
    }

}