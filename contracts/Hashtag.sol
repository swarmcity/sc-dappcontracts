pragma solidity ^0.4.15;

/**
  *  @title Hashtag
	*  @dev Created in Swarm City anno 2017,
	*  for the world, with love.
	*  @description This is the hashtag contract for creating Swarm City marketplaces.
	*  This contract is used in by the hashtagFactory to spawn new hashtags. It's a
	*  MiniMe based contract, that holds the reputation balances,
	*  and mint the reputation tokens.
	*  This contract is expanded by a dealFactory in 'address dealFactory'.
	*/


import './Ownable.sol';
import './MiniMeToken.sol';

contract Hashtag is Ownable {
	/// @param_name The human readable name of the hashtag
	/// @param_dealFactory The type of deal that is created by this hashtag and the dealFactory that is allowed to mint rep
	/// @param_commission The fixed hashtag fee in SWT
	/// @param_token The SWT token
	/// @param_ProviderRep The rep token that is minted for the Provider
	/// @param_SeekerRep The rep token that is minted for the Seeker
	/// @param_metadataHash The IPFS hash metadata for this hashtag
	string public name;
	uint public commission;
	address dealFactory;
	MiniMeToken token;
	MiniMeToken ProviderRep;
	MiniMeToken SeekerRep;
	string public metadataHash;

        event DealRegistered(address dealContract);
	event ProviderRepAdded(address to, uint amount);
	event SeekerRepAdded(address to, uint amount);

	function Hashtag(address _token, address _tokenfactory, 
			string _name, uint _commission, 
			address _dealFactory, string _metadataHash, 
			address _ProviderRep, address _SeekerRep){
		/// @notice The function that creates the hashtag
		name = _name;
		/// @notice The dealFactory that can mint rep on this hashtag and sets the deal type
		dealFactory = _dealFactory;
		/// @notice The provider reputation token is created
		ProviderRep = MiniMeToken(_ProviderRep);

		/// @notice The seeker reputation token is created

		SeekerRep = MiniMeToken(_SeekerRep);
		token = MiniMeToken(_token);
		metadataHash = _metadataHash;
		commission = _commission;
	}

	/// @notice The Hashtag owner can always update the metadata for the hashtag.
	function setMetadataHash(string _metadataHash) onlyOwner {
		metadataHash = _metadataHash;
	}

	/// @notice The Hashtag owner can always change the commission amount
	function setCommission(uint _newCommission) onlyOwner {
		commission = _newCommission;
	}

	/// @notice This function mints Provider rep
	function mintProviderRep(address _receiver, uint _amount) {
		mintRep(ProviderRep, _receiver, _amount);
		ProviderRepAdded(_receiver, _amount);
	}

	/// @notice This function mints Seeker rep
	function mintSeekerRep(address _receiver, uint _amount) {
		mintRep(SeekerRep, _receiver, _amount);
		SeekerRepAdded(_receiver, _amount);
	}

	/// @notice this is the function minting anything
	function mintRep(MiniMeToken reptoken, address _receiver, uint _amount) internal {
		// Only valid DealFactory can mint
		require (msg.sender == dealFactory);
		require (reptoken.generateTokens(_receiver, _amount));
	}

	/// Read functions

	function getProviderRepTokenAddress()returns(address){
		return address(ProviderRep);
	}

	function getSeekerRepTokenAddress()returns(address){
		return address(SeekerRep);
	}

	function getTokenAddress()returns(address){
		return address(token);
	}

	function getConflictResolver() returns(address){
		return owner;
	}

}
