pragma solidity ^0.5.0;

import "node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./EthereumClaimsRegistry.sol";


/**
 * @title EEA Claims issuer
 */




contract EEAClaimsIssuer is Ownable{

    // Register Claims Registry Address
    EthereumClaimsRegistry public claimsRegistry;

    event MemberShipAdded(
        address indexed issuer,
        address indexed subject,
        uint updatedAt
    );

    event MembershipRevoked(
        address indexed issuer,
        address indexed subject,
        uint removedAt
    );

    event ClaimAdded(
        address indexed issuer,
        address indexed subject,
        bytes32 indexed key,
        bytes32 value,
        uint updatedAt
    );

     event ClaimRemoved(
        address indexed issuer,
        address indexed subject,
        bytes32 indexed key,
        uint removedAt
    );


    constructor(address _claimsRegistry) public {
        //set claims registry
        claimsRegistry = EthereumClaimsRegistry(_claimsRegistry);
    }


    function setMembershipClaim(address organization) external onlyOwner {
        claimsRegistry.setClaim(organization, keccak256(abi.encodePacked("membership")), keccak256(abi.encodePacked("true")));
        emit MemberShipAdded(msg.sender, organization, now);
    }

    function revokeMembership(address organization) external onlyOwner {
        claimsRegistry.removeClaim(address(this), organization, keccak256(abi.encodePacked("membership")));
        emit MembershipRevoked(msg.sender, organization, now);

    }

    function setClaim(address subject, bytes32 key, bytes32 value) external onlyOwner {
        claimsRegistry.setClaim(subject, key, value);
        emit ClaimAdded(msg.sender, subject, key, value, now);
    }

    function removeClaim(address subject, bytes32 key) external onlyOwner {
        claimsRegistry.removeClaim(address(this), subject, key);
        emit ClaimRemoved(msg.sender, subject, key, now);
    }





}
