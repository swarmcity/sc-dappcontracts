pragma solidity ^0.4.15;

	/// Created for the world, from Swarm City, with love.

import './IMiniMeToken.sol';
import './IHashtag.sol';
import './Ownable.sol';
import './DealForTwoEnumerable.sol';

contract DealForTwoFactory is DealForTwoEnumerable {
	/// This is the factory for a Deal for Two. This contract is used in the hastag contract to create the deals, and mint the reputation tokens. This contract is referenced in 'address dealFactory' in the hashtag contract.
	/// @event_NewDealForTwo This event is fired when a new deal for two is created.
	/// @event_FundDeal This event is fired when a deal is been funded by a party.
	/// @event_DealStatusChange This event is fired when a deal status is updated.
	event NewDealForTwo(address owner,string dealid, string metadata);
	event FundDeal(address provider,address owner, string dealid,string metadata);
	event DealStatusChange(address owner,string dealid,DealStatuses newstatus,string metadata);

	/// @struct_dealStruct The deal object.
	/// @param_status Coming from DealForTwoEnumerable.sol.
	/// Statuses: Open, InProgress, Done, Disputed, Resolved, Cancelled
	/// @param_commissionValue The value of the hashtag commission is stored in the deal. This prevents the hashtagmaintainer to influence an existing deal when changing the hashtagcommission fee.
	/// @param_dealValue The value of the deal (SWT)
	/// @param_provider The address of the provider
	/// @param_deals Array of deals made by this dealFactory
	/// @param_hashtag The hashtag for which the factory is creating deals
	/// @param_hashtagToken SWT [KF] Can't we get the hashtagtoken from hashtag.token?
	struct dealStruct {
		DealStatuses status;
		uint commissionValue;
		uint dealValue;
		address provider;
	}

	mapping(bytes32=>dealStruct) deals;

	IHashtag public hashtag;
	IMiniMeToken public hashtagToken;  /// [KF] Can't we get the hashtagtoken from hashtag.token?

	function DealForTwoFactory(IHashtag _hashtag){
		hashtag = _hashtag;
		hashtagToken = IMiniMeToken(_hashtag.getTokenAddress());
	}

	function makeDealForTwo(string _dealid, uint _offerValue, string _metadata){

		// make sure there is enough to pay the commission later on
		require (hashtag.commission() / 2 <= _offerValue);

		// fund this deal
		require (hashtagToken.transferFrom(msg.sender,this,_offerValue));

		// if deal already exists don't allow to overwrite it
		require (deals[sha3(msg.sender,_dealid)].commissionValue == 0);

		// if it's funded - fill in the details
		deals[sha3(msg.sender,_dealid)] = dealStruct(DealStatuses.Open,hashtag.commission(),_offerValue,0);

		NewDealForTwo(msg.sender,_dealid,_metadata);

	}

	function cancelDeal(string _dealid,string _metadata){
		dealStruct storage d = deals[sha3(msg.sender,_dealid)];
		if (d.dealValue > 0 && d.provider == 0x0 && d.status == DealStatuses.Open)
		{
			// cancel this Deal
			require (hashtagToken.transfer(msg.sender,d.dealValue));
			deals[sha3(msg.sender,_dealid)].status = DealStatuses.Canceled;

			DealStatusChange(msg.sender,_dealid,DealStatuses.Canceled,_metadata);
		}
	}

	// seeker or provider can choose to dispute an ongoing deal
	function dispute(string _dealid, address _dealowner,string _metadata){
		dealStruct storage d = deals[sha3(_dealowner,_dealid)];
		require (d.status == DealStatuses.Open);

		if (msg.sender == _dealowner){
			// seeker goes in conflict

			// can only be only when there is a provider
			require (d.provider != 0x0 );

		}else{
			// if not the seeker, only the provider can go in conflict
			require (d.provider == msg.sender);
		}
		// mark the deal as Disputed
		deals[sha3(_dealowner,_dealid)].status = DealStatuses.Disputed;
		DealStatusChange(_dealowner,_dealid,DealStatuses.Disputed,_metadata);
	}

	// conflict resolver can resolve a disputed deal
	function resolve(string _dealid, address _dealowner, uint _seekerFraction, string _metadata){
		dealStruct storage d = deals[sha3(_dealowner,_dealid)];

		// this function can only be called by the current conflict resolver of the hastag
		require (msg.sender == hashtag.getConflictResolver());

		// only disputed deals can be resolved
		require (d.status == DealStatuses.Disputed) ;

		// send the seeker fraction back to the dealowner
		require (hashtagToken.transfer(_dealowner,_seekerFraction));

		// send the remaining deal value back to the provider
		require (hashtagToken.transfer(d.provider,d.dealValue - _seekerFraction));

		deals[sha3(_dealowner,_dealid)].status = DealStatuses.Resolved;
		DealStatusChange(_dealowner,_dealid,DealStatuses.Resolved,_metadata);

	}

	function fundDeal(string _dealid, address _dealowner,string _metadata){

		bytes32 key = sha3(_dealowner,_dealid);

		dealStruct storage d = deals[key];
                // only allow open deals to be funded
		require (d.status == DealStatuses.Open);

		// if the provider is filled in - the deal was already funded
		require (d.provider == 0x0);

		// put the tokens from the provider on the deal
		require (hashtagToken.transferFrom(msg.sender,this,d.dealValue));

		// fill in the address of the provider ( to payout the deal later on )
		deals[key].provider = msg.sender;

		FundDeal(msg.sender,_dealowner,_dealid,_metadata);
	}

	function readDeal(string _dealid, address _dealowner) returns(DealStatuses status, uint commissionValue, uint dealValue, address provider){
		bytes32 key = sha3(_dealowner,_dealid);
		return (deals[key].status,deals[key].commissionValue,deals[key].dealValue,deals[key].provider);
	}

	function payout(string _dealid,string _metadata){

		bytes32 key = sha3(msg.sender,_dealid);

		dealStruct storage d = deals[key];

		// you can only payout open deals
		require (d.status == DealStatuses.Open);

		// pay out commission
		require (hashtagToken.transfer(hashtag.getConflictResolver(),d.commissionValue));

		// pay out the provider
		require (hashtagToken.transfer(d.provider,d.dealValue * 2 - d.commissionValue));

		// mint REP for both parties
		hashtag.mintProviderRep(d.provider,5);
		hashtag.mintSeekerRep(msg.sender,5);

		// mark the deal as done
		deals[key].status = DealStatuses.Done;
		DealStatusChange(msg.sender,_dealid,DealStatuses.Done,_metadata);

	}

}
