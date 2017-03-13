pragma solidity ^0.4.8;

/*
 * Ownable
 *
 * Base contract with an owner.
 * Provides onlyOwner modifier, which prevents function from running if it is called by anyone other than the owner.
 */
contract Ownable {
  address public owner;

  function Ownable() {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    if (msg.sender != owner) {
      throw;
    }
    _;
  }

  function transferOwnership(address newOwner) onlyOwner {
    if (newOwner != address(0)) {
      owner = newOwner;
    }
  }

}

contract Parameters is Ownable {
	mapping (string => string) parameters;

	function setParameter(string _name, string _value) onlyOwner external {
		parameters[_name] = _value;
	}

  function getParameter(string _name) returns(string){
    return parameters[_name];
  }

}