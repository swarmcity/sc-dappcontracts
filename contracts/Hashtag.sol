pragma solidity ^0.4.15;

import './Ownable.sol';
import './MiniMeToken.sol';

contract Hashtag is Ownable {

	string public name;
	//uint public registeredDeals;
	//uint public successfulDeals;
	mapping(address=>address) dealOwners;	// maps deal contracts to owners
	mapping(address=>bool) public validFactories;	// who can access this hashtag ?
	uint public commission;

	MiniMeToken token;	// the token this hashtagcontract uses
	
	MiniMeToken ProviderRep;	// the provider reputation token ( clonable )
	MiniMeToken RequesterRep;	// the requester reputation token ( clonable )


	string public metadataHash;	// IPFS hash to metadata of this Hashtag

	event DealRegistered(address dealContract);
	event ProviderRepAdded(address to, uint amount);
	event RequesterRepAdded(address to, uint amount);

	function Hashtag(address _token, address _tokenfactory, string _name,uint _commission,string _metadataHash){

		name = _name;

		ProviderRep = new MiniMeToken(
			_tokenfactory,
			0,
            0,
            _name,
            0,
            'SWR',
            false
		);

		RequesterRep = new MiniMeToken(
			_tokenfactory,
			0,
            0,
            _name,
            0,
            'SWR',
            false
		);		

		token = MiniMeToken(_token);
		metadataHash = _metadataHash;
		commission = _commission;
	}


	function setMetadataHash(string _metadataHash) onlyOwner {
		metadataHash = _metadataHash;
	}

	function setCommission(uint _newCommission) onlyOwner {
		commission = _newCommission;
	}

	function addFactory(address _factoryAddress) onlyOwner {
		validFactories[_factoryAddress] = true;
	}

	function removeFactory(address _factoryAddress) onlyOwner {
		validFactories[_factoryAddress] = false;
	}

	// function isValidFactory(address _factoryAddress)returns(bool){
	// 	return (validFactories[_factoryAddress] == true);
	// }

	function getProviderRepTokenAddress()returns(address){
		// Duplicate this for the second Rep token
		return address(ProviderRep);
	}
	function getRequesterRepTokenAddress()returns(address){
		// Duplicate this for the second Rep token
		return address(RequesterRep);
	}

	function getTokenAddress()returns(address){
		return address(token);
	}

	function getConflictResolver() returns(address){
		return owner;
	}

	function mintProviderRep(address _receiver,uint _amount) {
		mintRep(ProviderRep,_receiver,_amount);
		ProviderRepAdded(_receiver,_amount);
	}

	function mintRequesterRep(address _receiver,uint _amount) {
		mintRep(RequesterRep,_receiver,_amount);
		RequesterRepAdded(_receiver,_amount);
	}

	function mintRep(MiniMeToken reptoken, address _receiver,uint _amount) internal {

		// Only valid DealFactory contracts can mint rep ?
		require (validFactories[msg.sender] != true);
			
		require (reptoken.generateTokens(_receiver,_amount));
	}

}
