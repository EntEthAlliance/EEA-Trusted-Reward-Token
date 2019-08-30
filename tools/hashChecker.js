const sha3 = require('web3-utils').sha3;
const fs = require('fs');
const assert = require('assert');

// Valid hashes using Keccak-256

const contracts = {
    SafeMath      : fs.readFileSync('node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol'),
    Pausable      : fs.readFileSync('node_modules/openzeppelin-solidity/contracts/lifecycle/Pausable.sol'),
    Ownable       : fs.readFileSync('node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol'),
    ERC20         : fs.readFileSync('node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol'),    
    MintableToken : fs.readFileSync('node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol'),
};

const hashes = {
    Pausable      : '0x49d41cc2b80f7732cdb504d67cd9a84ebeee38f8ec7204c96c2bded71e295f6a',
    Ownable       : '0x6b9a8d21ee036adce3153c500c42b53e0023d3d208e0cf743ae28d3bd278e9c0',
    ERC20         : '0x825e45187f8351a073223d982c590abf309ecef6136d15db8e15c26bba4cb886',
    SafeMath      : '0x9903644053e28ff0bbd71fa0f2ad018e22ab91c186b8f3b5ea027aa938b8d8ab',
    MintableToken : 'ox029aefb8cdff2e8d2a89dba2326e2a905ad3d713c9dec4bb0032fa975b1be9c5'
};

Object.keys(contracts).forEach((key) => {
    try {
        assert.equal(sha3(contracts[key]), hashes[key], 'Hash mismatch: ' + key);
    } catch (error) {
        console.log(error.message + ' - Zeppelin Framework');
        console.log(key + ': ' + sha3(contracts[key]));
    }
});
