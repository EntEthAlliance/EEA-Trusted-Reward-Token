pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC777/ERC777.sol";


/**
 * @title EEA Penalty Token
 */
contract PenaltyToken is ERC777 {

    /**
     * @dev Constructor that sets default operators.
     */
    constructor(address[] memory defaultOperators) public ERC777("PenaltyToken", "EEAP", defaultOperators) {
    }

    /**
     * @dev Similar to operator burn, see `IERC777.operatorBurn`.
     *
     * Emits `Minted` and `Transfer` events.
     */
    function operatorMint(address account, uint256 amount, bytes calldata data, bytes calldata operatorData) external {
       require(isOperatorFor(msg.sender, account), "ERC777: caller is not an operator for holder");
      _mint(msg.sender, account, amount, data, operatorData);
    }

    /// RESTRICTED METHODS, TOKEN HOLDERS ARE NOT ALLOWED TO BE CALL THEM

    /**
     * @dev See `IERC777.send`.
     *
     * Also emits a `Transfer` event for ERC20 compatibility.
     */
    function send(address recipient, uint256 amount, bytes calldata data) external {
        revert("You cannot transfer penalties");
    }

    /**
     * @dev See `IERC20.transfer`.
     *
     * Unlike `send`, `recipient` is _not_ required to implement the `tokensReceived`
     * interface if it is a contract.
     *
     * Also emits a `Sent` event.
     */
    function transfer(address recipient, uint256 amount) external returns (bool) {
      revert("You cannot transfer penalties");
    }

    /**
    * @dev See `IERC20.transferFrom`.
    *
    * Note that operator and allowance concepts are orthogonal: operators cannot
    * call `transferFrom` (unless they have allowance), and accounts with
    * allowance cannot call `operatorSend` (unless they are operators).
    *
    * Emits `Sent`, `Transfer` and `Approval` events.
    */
    function transferFrom(address holder, address recipient, uint256 amount) external returns (bool) {
      revert("You cannot transfer penalties");
    }

    /**
     * @dev See `IERC20.approve`.
     *
     * Note that accounts cannot have allowance issued by their operators.
     */
    function approve(address spender, uint256 value) external returns (bool) {
      revert("You cannot transfer penalties");
    }

    /**
     * @dev See `IERC777.burn`.
     *
     * Also emits a `Transfer` event for ERC20 compatibility.
     */
    function burn(uint256 amount, bytes calldata data) external {
      revert("You cannot burn penalties");
    }

    /**
     * @dev See `IERC777.authorizeOperator`.
     */
    function authorizeOperator(address operator) external {
      revert("You cannot change operators of penalties");
    }

    /**
     * @dev See `IERC777.revokeOperator`.
     */
    function revokeOperator(address operator) external {
      revert("You cannot change operators of penalties");
    }

}
