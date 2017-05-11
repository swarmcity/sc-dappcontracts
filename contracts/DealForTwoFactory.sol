pragma solidity ^0.4.11;

import './IMiniMeToken.sol';
import './IHashtag.sol';
import '../installed_contracts/zeppelin/contracts/ownership/Ownable.sol';
import './DealForTwoEnumerable.sol';
import './DealForTwo.sol';

contract DealForTwoFactory is DealForTwoEnumerable {
	event NewDealForTwo(address dealForTwoAddress);

	function makeDealForTwo(IHashtag _hashtag, uint _offerValue){
		address deal = new DealForTwo(msg.sender,_hashtag,_offerValue); //msg.sender,_hashtag,_counterparty,_counterpartyThreshold,_dealID);
		//IHashtag(_hashtag).registerDeal(deal,msg.sender);
		NewDealForTwo(deal);
	}

	function assignProvider(DealForTwo _deal, address _provider, uint _newSeekerValue, uint _providerValue){

		// Only the seeker can assign a provider
		if (msg.sender != _deal.seeker()){ throw; }
		// Only when the dealstatus is 'open'
		if (_deal.status() != DealStatuses.Open){ throw; }
		// Only when he has put enough tokens on the contract
		if (IMiniMeToken(_deal.hashtag().getTokenAddress()).balanceOf(_deal) < _newSeekerValue){ throw; }

		// refund the difference - if any
		if (_deal.seekerValue() > _newSeekerValue){
			if (!_deal.payout(_deal.seeker(),_deal.seekerValue() - _newSeekerValue)){throw;}
		}

		_deal.assignTo(_newSeekerValue,_provider,_providerValue);
	}

	function payout(DealForTwo _deal){
		// Only the seeker can payout
		if (msg.sender != _deal.seeker()){ throw; }
		// Only when the dealstatus is 'open'
		if (_deal.status() != DealStatuses.Open){ throw; }
		// you can only payout when both parties have funded the deal
		if (IMiniMeToken(_deal.hashtag().getTokenAddress()).balanceOf(_deal) < (_deal.seekerValue() + _deal.providerValue())){ throw; }
		// okay - payout the provider please
		if (!_deal.payout(_deal.provider(),_deal.seekerValue() + _deal.providerValue())){ throw; }

		_deal.hashtag().mintRep(_deal.seeker(),1);
		_deal.hashtag().mintRep(_deal.provider(),1);

		_deal.setStatus(DealStatuses.Done);
	}

}

