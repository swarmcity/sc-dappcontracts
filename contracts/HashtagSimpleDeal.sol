pragma solidity ^0.4.15;

/**
  *  @title Simple Deal Hashtag
	*  @dev Created in Swarm City anno 2017,
	*  for the world, with love.
	*  @description Symmetrical Escrow Deal Contract
	*  @description This is the hashtag contract for creating Swarm City marketplaces.
	*  This contract is used in by the hashtagFactory to spawn new hashtags. It's a
	*  MiniMe based contract, that holds the reputation balances,
	*  and mint the reputation tokens.
	*  This contract makes a specific kind of deals called "SimpleDeals"
	*/

import './Ownable.sol';
import './IMiniMeToken.sol';

contract HashtagSimpleDeal is Ownable {
	/// @param_name The human readable name of the hashtag
	/// @param_commission The fixed hashtag fee in SWT
	/// @param_token The SWT token
	/// @param_ProviderRep The rep token that is minted for the Provider
	/// @param_SeekerRep The rep token that is minted for the Seeker
	/// @param_payoutaddress The address where the commission is sent.
	/// @param_metadataHash The IPFS hash metadata for this hashtag
	string public name;
	uint public commission;
	IMiniMeToken token;
	IMiniMeToken ProviderRep;
	IMiniMeToken SeekerRep;
	address public payoutaddress;
	string public metadataHash;

	// @notice DealStatuses enum
	enum DealStatuses {
		Open,
		Done,
		Disputed,
		Resolved,
		Cancelled, 
		InProgress
	}

	/// @param_dealStruct The deal object.
	/// @param_status Coming from DealStatuses enum.
	/// Statuses: Open, Done, Disputed, Resolved, Cancelled
	/// @param_commissionValue The value of the hashtag commission is stored in the deal. This prevents the hashtagmaintainer to influence an existing deal when changing the hashtagcommission fee.
	/// @param_dealValue The value of the deal (SWT)
	/// @param_provider The address of the provider
	/// @param_deals Array of deals made by this hashtag

	struct dealStruct {
		DealStatuses status;
		uint commissionValue;
		uint dealValue;
		address provider;
	}

	mapping(bytes32=>dealStruct) deals;

	/// Deal registered
	event DealRegistered(string dealid);

	/// Reputation token for provider is minted and sent
	event ProviderRepAdded(address to, uint amount);

	/// Reputation token for seeker is minted and sent
	event SeekerRepAdded(address to, uint amount);

	/// @dev Event NewDealForTwo - This event is fired when a new deal for two is created.
	event NewDealForTwo(address owner,string dealid, string metadata);

	/// @dev Event FundDeal - This event is fired when a deal is been funded by a party.
	event FundDeal(address provider,address owner, string dealid,string metadata);

	/// @dev DealStatusChange - This event is fired when a deal status is updated.
	event DealStatusChange(address owner,string dealid,DealStatuses newstatus,string metadata);

	/// @notice The function that creates the hashtag
	function HashtagSimpleDeal(address _token, string _name, uint _commission, string _metadataHash,
			address _ProviderRep, address _SeekerRep){

		/// @notice The name of the hashtag is set
		name = _name;

		/// @notice The provider reputation token is created
		ProviderRep = IMiniMeToken(_ProviderRep);

		/// @notice The seeker reputation token is created
		SeekerRep = IMiniMeToken(_SeekerRep);

		/// @notice SWT token is added
		token = IMiniMeToken(_token);

		/// Metadata added
		metadataHash = _metadataHash;

		/// Commission is set to ...
		commission = _commission;

		/// Commission payout address is set
		/// First time we set it to msg.sender
		payoutaddress = msg.sender;
	}

	/// @notice The Hashtag owner can always update the payout address.
	function setPayoutAddress(address _payoutaddress) onlyOwner {
		payoutaddress = _payoutaddress;
	}

	/// @notice The Hashtag owner can always update the metadata for the hashtag.
	function setMetadataHash(string _metadataHash) onlyOwner {
		metadataHash = _metadataHash;
	}

	/// @notice The Hashtag owner can always change the commission amount
	function setCommission(uint _newCommission) onlyOwner {
		commission = _newCommission;
	}

	/// @notice Read functions
	/// @notice getProviderRepTokenAddress
	/// @return address ProviderRep
	function getProviderRepTokenAddress()returns(address){
		return address(ProviderRep);
	}

	/// @notice getSeekerRepTokenAddress
	/// @return address SeekerRep
	function getSeekerRepTokenAddress()returns(address){
		return address(SeekerRep);
	}

	/// @notice getTokenAddress
	/// @return address token
	function getTokenAddress()returns(address){
		return address(token);
	}

	/// @notice getConflictResolver
	/// @return address owner
	function getConflictResolver() returns(address){
		return owner;
	}

	/// @notice getPayoutAddress
	/// @return address payoutaddress
	function getPayoutAddress() returns(address){
		return payoutaddress;
	}

	/// @notice The Deal making stuff

	/// @notice The create Deal function
	function makeDealForTwo(string _dealid, uint _offerValue, string _metadata){

		// make sure there is enough to pay the commission later on
		require (commission / 2 <= _offerValue);

		// fund this deal
                require ( _offerValue + commission / 2 >= _offerValue); //overflow protection
		require (token.transferFrom(msg.sender,this, _offerValue + commission / 2));

		// if deal already exists don't allow to overwrite it
		require (deals[sha3(msg.sender,_dealid)].commissionValue == 0 && 
			deals[sha3(msg.sender,_dealid)].dealValue == 0);

		// if it's funded - fill in the details
		deals[sha3(msg.sender,_dealid)] = dealStruct(DealStatuses.Open,commission,_offerValue,0);

		NewDealForTwo(msg.sender,_dealid,_metadata);

	}

	/// @notice The Cancel deal function
	/// @notice Half of the hashtagfee is sent to payoutaddress
	function cancelDeal(string _dealid,string _metadata){
		dealStruct storage d = deals[sha3(msg.sender,_dealid)];
		if (d.dealValue > 0 && d.provider == 0x0 && d.status == DealStatuses.Open)
		{
			// @dev if you cancel the deal you pay the hashtagfee / 2
			require (token.transfer(payoutaddress,d.commissionValue / 2));

			// @dev cancel this Deal
			require (token.transfer(msg.sender,d.dealValue - d.commissionValue / 2));

			deals[sha3(msg.sender,_dealid)].status = DealStatuses.Cancelled;

			DealStatusChange(msg.sender,_dealid,DealStatuses.Cancelled,_metadata);
		}
	}

	/// @notice seeker or provider can choose to dispute an ongoing deal
	function dispute(string _dealid, address _dealowner,string _metadata){
		dealStruct storage d = deals[sha3(_dealowner,_dealid)];
		require (d.status == DealStatuses.Open);

		if (msg.sender == _dealowner){
			/// @dev seeker goes in conflict

			/// @dev can only be only when there is a provider
			require (d.provider != 0x0 );

		}else{
			/// @dev if not the seeker, only the provider can go in conflict
			require (d.provider == msg.sender);
		}
		/// @dev mark the deal as Disputed
		deals[sha3(_dealowner,_dealid)].status = DealStatuses.Disputed;
		DealStatusChange(_dealowner,_dealid,DealStatuses.Disputed,_metadata);
	}

	/// @notice conflict resolver can resolve a disputed deal
	function resolve(string _dealid, address _dealowner, uint _seekerFraction, string _metadata){
		dealStruct storage d = deals[sha3(_dealowner,_dealid)];

		/// @dev this function can only be called by the current conflict resolver of the hastag
		/// @dev Which is owner for now
		require (msg.sender == owner);

		/// @dev only disputed deals can be resolved
		require (d.status == DealStatuses.Disputed) ;

		/// @dev pay out commission
		require (token.transfer(payoutaddress,d.commissionValue));

		/// @dev send the seeker fraction back to the dealowner
		require (token.transfer(_dealowner,_seekerFraction));

		/// @dev send the remaining deal value back to the provider
		require (token.transfer(d.provider,d.dealValue * 2 - _seekerFraction));

		deals[sha3(_dealowner,_dealid)].status = DealStatuses.Resolved;
		DealStatusChange(_dealowner,_dealid,DealStatuses.Resolved,_metadata);

	}

	/// @notice Provider has to fund the deal
	function fundDeal(string _dealid, address _dealowner,string _metadata){

		bytes32 key = sha3(_dealowner,_dealid);

		dealStruct storage d = deals[key];

		/// @dev only allow open deals to be funded
		require (d.status == DealStatuses.Open);

		/// @dev if the provider is filled in - the deal was already funded
		require (d.provider == 0x0);

		/// @dev put the tokens from the provider on the deal
		require (token.transferFrom(msg.sender,this,d.dealValue + d.commissionValue / 2));

		/// @dev fill in the address of the provider ( to payout the deal later on )
		deals[key].provider = msg.sender;

		FundDeal(msg.sender,_dealowner,_dealid,_metadata);
	}

	/// @notice Read the details of a deal
	function readDeal(string _dealid, address _dealowner) returns(DealStatuses status, uint commissionValue, uint dealValue, address provider){
		bytes32 key = sha3(_dealowner,_dealid);
		return (deals[key].status,deals[key].commissionValue,deals[key].dealValue,deals[key].provider);
	}

	/// @notice The payout function can only be called by the deal owner.
	function payout(string _dealid,string _metadata){

		bytes32 key = sha3(msg.sender,_dealid);

		dealStruct storage d = deals[key];

		/// @dev you can only payout open deals
		require (d.status == DealStatuses.Open);

		/// @dev pay out commission
		require (token.transfer(payoutaddress,d.commissionValue));

		/// @dev pay out the provider
		require (token.transfer(d.provider,d.dealValue * 2));

		/// @dev mint REP for Provider
		ProviderRep.generateTokens(d.provider, 5);
		ProviderRepAdded(d.provider, 5);

		/// @dev mint REP for Seeker
		SeekerRep.generateTokens(msg.sender, 5);
		SeekerRepAdded(msg.sender, 5);

		/// @dev mark the deal as done
		deals[key].status = DealStatuses.Done;
		DealStatusChange(msg.sender,_dealid,DealStatuses.Done,_metadata);

	}

}
