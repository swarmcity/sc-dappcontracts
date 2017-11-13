pragma solidity ^0.4.15;

import './Ownable.sol';

contract SwarmCity is Ownable {

	string public SwarmCityHash;
	mapping public (address => bool) vouchers;
	uint public numVouchers;

	function setSwarmCity(string _hash) onlyOwner external {
		numVouchers = 0;
		delete vouchers;
		SwarmCityHash = _hash;
		//this?
		vouchSwarmCity(msg.sender);
	}

	function vouchSwarmCity(string _ipfshash) external {
		vouchers[msg.sender] = true;
		numVouchers++;
	}

	function checkSwarmCity(address _address) returns bool external {
		return vouchers[_address];
	}

}
