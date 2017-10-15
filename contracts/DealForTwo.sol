
pragma solidity ^0.4.11;


import './IMiniMeToken.sol';
import './IHashtag.sol';
import './DealForTwoEnumerable.sol';
import '../installed_contracts/zeppelin/contracts/ownership/Ownable.sol';

contract DealForTwo is DealForTwoEnumerable,Ownable {
	DealStatuses public status;
	uint public seekerValue;
	uint public providerValue;
	address public seeker;
	address public provider;
	IHashtag public hashtag;

	function DealForTwo(address _seeker, IHashtag _hashtag, uint _offerValue){
		seeker = _seeker;
		seekerValue = _offerValue;
		hashtag = _hashtag;
		status = DealStatuses.Open;
	}

	function payout(address _to,uint _amount) onlyOwner returns (bool success){ 
		return IMiniMeToken(hashtag.getTokenAddress()).transfer(_to,_amount);
	}

	function assignTo(uint _newSeekerValue, address _provider, uint _providerValue) onlyOwner {
		provider = _provider;
		providerValue = _providerValue;
		seekerValue = _newSeekerValue;
	}

	function setStatus(DealStatuses _newStatus){
		status = _newStatus;
	}
}



