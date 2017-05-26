pragma solidity ^0.4.11;

import './IMiniMeToken.sol';
import './IHashtag.sol';
import '../installed_contracts/zeppelin/contracts/ownership/Ownable.sol';
import './DealForTwoEnumerable.sol';

contract DealForTwoFactory is DealForTwoEnumerable {
	event NewDealForTwo(address dealForTwoAddress);

	struct dealStruct {
		DealStatuses status;
		uint commissionValue;
		uint dealValue;
		address provider;
	}

	mapping(bytes32=>dealStruct) deals;

	IHashtag hashtag;
	IMiniMeToken hashtagToken;

	function DealForTwoFactory(IHashtag _hashtag){
		hashtag = _hashtag;
		hashtagToken = IMiniMeToken(_hashtag.getTokenAddress());
	}

	function makeDealForTwo(string _dealid, uint _offerValue){

		// make sure there is enough to pay the commission later on
		if (hashtag.commission() / 2 > _offerValue){
			throw;
		}

		// fund this deal
		if (!hashtagToken.transferFrom(msg.sender,this,_offerValue)){
			throw;
		}

		// if it's funded - fill in the details
		deals[sha3(msg.sender,_dealid)] = dealStruct(DealStatuses.Open,hashtag.commission(),_offerValue,0);

	
	}

	function fundDeal(string _dealid, address _dealowner){
		
		bytes32 key = sha3(_dealowner,_dealid);
		
		dealStruct d = deals[key];

		// if the provider is filled in - the deal was already funded
		if (d.provider != 0x0){
			throw;
		}

		// put the tokens from the provider on the deal
		if (!hashtagToken.transferFrom(msg.sender,this,d.dealValue)){
			throw;
		}

		// fill in the address of the provider ( to payout the deal later on )
		deals[key].provider = msg.sender;
	}

	function payout(string _dealid){

		bytes32 key = sha3(msg.sender,_dealid);

		dealStruct d = deals[key];
		
		// you can only payout open deals
		if (d.status != DealStatuses.Open){ throw; }

		// pay out commission
		if (!hashtagToken.transfer(hashtag.getConflictResolver(),d.commissionValue)){ throw; }

		// pay out the provider
		if (!hashtagToken.transfer(d.provider,d.dealValue * 2 - d.commissionValue)){ throw; }

		// mint REP for both parties
		hashtag.mintRep(d.provider,1);
		hashtag.mintRep(msg.sender,1);

		// mark the deal as done
		deals[key].status = DealStatuses.Done;
	}

}

