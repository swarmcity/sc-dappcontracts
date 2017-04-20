pragma solidity ^0.4.8;

import '../installed_contracts/zeppelin/contracts/ownership/Ownable.sol';
import './MiniMeToken.sol';

contract Hashtag is Ownable {
	
	string public name;
	uint public registeredDeals;
	uint public successfulDeals;
	mapping(address=>address) dealOwners;	// maps deal contracts to owners
	uint public commission;

	MiniMeToken token;	// the token this hashtagcontract uses
	MiniMeToken rep;	// the reputation token ( clonable )

	event DealRegistered(address dealContract);
	event RepAdded(address to);

	function Hashtag(address _token, string _name,uint _commission){
		name = _name;
		MiniMeTokenFactory f = new MiniMeTokenFactory(); 
		rep = new MiniMeToken(
			f,
			0,
            0,
            _name,
            0,
            'HTAG',
            false
		);
		token = MiniMeToken(_token);
	}

	function getRepTokenAddress()returns(address){
		return address(rep);
	}

	function getTokenAddress()returns(address){
		return address(token);
	}

	function getConflictResolver() returns(address){
		return owner;
	}

	function registerDeal(address _dealContract,address _dealOwner){
		if (dealOwners[_dealContract] != 0){
			throw;
		}
		dealOwners[_dealContract] = _dealOwner;
		registeredDeals++;
		DealRegistered(_dealContract);
	}


	// debug function - remove me ASAP :)
	function mintRep(address _receiver,uint _amount) {
		rep.generateTokens(_receiver,_amount);
		RepAdded(_receiver);
	} 

}