pragma solidity ^0.5.0;


import "./EthereumClaimsRegistry.sol";
import "./EthereumDIDRegistry.sol";


/**
 * @title EEA Transferable Token
 */
contract EEATransferableToken {

    EthereumDIDRegistry public didRegistry;
    EthereumClaimsRegistry public claimsRegistry;
    address public eeaIssuer; //TODO: Create EEA issuer SC




    function _memberCheck(address member) internal view returns (bool) {
        bytes32 claim = claimsRegistry.getClaim(msg.sender, member, keccak256(abi.encodePacked("membership")));
        if (claim == keccak256(abi.encodePacked("true"))){
            return true;
        }
    }



  constructor(address _didRegistry,
    address _claimsRegistry,
    address _eeaIssuer) public {

    //set registries and EEA Issuer address
    didRegistry = EthereumDIDRegistry(_didRegistry);
    claimsRegistry = EthereumClaimsRegistry(_claimsRegistry);
    eeaIssuer = _eeaIssuer;
  }


}
