pragma solidity ^0.4.8;

import 'zeppelin/ownership/Ownable.sol';

contract Parameters is Ownable {
	mapping (string => string) parameters;

	function setParameter(string _name, string _value) onlyOwner external {
		parameters[_name] = _value;
	}

  function getParameter(string _name) constant returns (string){
    return parameters[_name];
  }

}