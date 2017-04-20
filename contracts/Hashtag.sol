pragma solidity ^0.4.8;

import 'zeppelin/ownership/Ownable.sol';
import './MiniMeToken.sol';

contract Hashtag is Ownable {
	
	string name;
	uint registeredDeals;
	uint successfulDeals;
	mapping(address=>address) dealOwners;	// maps deal contracts to owners
	uint commission;

	MiniMeToken public rep;

	event DealAdded(address dealContract);
	event RepAdded(address to);

	function Hashtag(string _name,uint _commission){
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
	}

	// function registerDeal(address _dealContract,address _dealOwner){
	// 	if (dealOwners[_dealContract]){
	// 		throw;
	// 	}
	// 	dealOwners[_dealContract] = _dealOwner;
	// 	registeredDeals++;
	// 	DealAdded(_dealContract);
	// }


	// debug function - remove me ASAP :)
	function mintRep(address _receiver,uint _amount) {
		rep.generateTokens(_receiver,_amount);
		RepAdded(_receiver);
	} 

}