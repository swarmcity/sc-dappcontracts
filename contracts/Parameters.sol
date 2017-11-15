pragma solidity ^0.4.15;

import './Ownable.sol';

contract Parameters is Ownable {
	mapping (string => string) parameters;

	event ParameterSet(string name, string ipfsValue);

	function setParameter(string _name, string _value) onlyOwner external {
		ParameterSet(_name,_value);
		parameters[_name] = _value;
	}

  function getParameter(string _name) constant returns (string){
    return parameters[_name];
  }

}
