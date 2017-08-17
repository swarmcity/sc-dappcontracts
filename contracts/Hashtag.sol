pragma solidity ^0.4.8;

import '../installed_contracts/zeppelin/contracts/ownership/Ownable.sol';
import './MiniMeToken.sol';
import './Index.sol';

contract Hashtag is Ownable {
	
	string public name;
	uint public registeredDeals;
	uint public successfulDeals;
	mapping(address=>address) dealOwners;	// maps deal contracts to owners
	mapping(address=>bool) public validFactories;	// who can access this hashtag ?
	uint public commission;

	MiniMeToken token;	// the token this hashtagcontract uses
	MiniMeToken rep;	// the reputation token ( clonable )

	string public metadataHash;	// IPFS hash to metadata of this Hashtag

	event DealRegistered(address dealContract);
	event RepAdded(address to,uint amount);

	function Hashtag(address _token, address _tokenfactory, string _name, uint _commission, string _metadataHash, bool _indexMe) {
		name = _name;
//		MiniMeTokenFactory f = new MiniMeTokenFactory(); 
		rep = new MiniMeToken(
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
//		if (_indexMe) {
//			address index = ; //Need to insert the address.
//			index.call(bytes4(sha3("addMe(string, address)")), _name, _tokenfactory);
//		}
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
		// Only valid DealFactory contracts may register deals.
		if (validFactories[msg.sender] != true){
			throw;
		}

		// of this deal was already registered, throw.
		if (dealOwners[_dealContract] != 0){
			throw;
		}

		dealOwners[_dealContract] = _dealOwner;
		registeredDeals++;
		DealRegistered(_dealContract);
	}

	function mintRep(address _receiver,uint _amount) {
		// Only valid DealFactory contracts can mint rep ?
		if (validFactories[msg.sender] != true){
			throw;
		}

		rep.generateTokens(_receiver,_amount);
		RepAdded(_receiver,_amount);
	} 

}
