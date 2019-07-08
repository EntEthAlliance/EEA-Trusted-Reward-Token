pragma solidity ^0.5.0;


/**
 * @title EEA Non Transferable Token 
 */
contract NonTransferableToken {

    event ForbiddenOperation(bytes name, address indexed from, address indexed operator, uint256 amount, bytes data);


    /// RESTRICTED METHODS, TOKEN HOLDERS ARE NOT ALLOWED TO CALL THEM

    /**
     * @dev See `IERC777.send`.
     *
     * Also emits a `Transfer` event for ERC20 compatibility.
     */
    function send(address recipient, uint256 amount, bytes calldata data) external {
      emit ForbiddenOperation('send', msg.sender, recipient, amount, data);
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
      emit ForbiddenOperation('transfer', msg.sender, recipient, amount, '');
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
      emit ForbiddenOperation('transferFrom', holder, recipient, amount, '');
      revert("You cannot transfer penalties");
    }

    /**
     * @dev See `IERC20.approve`.
     *
     * Note that accounts cannot have allowance issued by their operators.
     */
    function approve(address spender, uint256 value) external returns (bool) {
      emit ForbiddenOperation('approve', msg.sender, spender, value, '');
      revert("You cannot transfer penalties");
    }

    /**
     * @dev See `IERC777.burn`.
     *
     * Also emits a `Transfer` event for ERC20 compatibility.
     */
    function burn(uint256 amount, bytes calldata data) external {
      emit ForbiddenOperation('burn', msg.sender, address(0), amount, data);
      revert("You cannot burn penalties");
    }

    /**
     * @dev See `IERC777.authorizeOperator`.
     */
    function authorizeOperator(address operator) external {
      emit ForbiddenOperation('authorizeOperator', msg.sender, operator, 0, '');
      revert("You cannot change operators of penalties");
    }

    /**
     * @dev See `IERC777.revokeOperator`.
     */
    function revokeOperator(address operator) external {
      emit ForbiddenOperation('revokeOperator', msg.sender, operator, 0, '');
      revert("You cannot change operators of penalties");
    }

}
