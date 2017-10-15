// [KF] should we remove this from our repo?


pragma solidity ^0.4.8;

import './SimpleDeal.sol';
import './IHashtag.sol';

contract SimpleDealFactory {
	event NewSimpleDeal(address simpleDealAddress);
	function makeSimpleDeal(address _hashtag, address _counterparty,uint _counterpartyThreshold, bytes32 _dealID){
		address deal = new SimpleDeal(msg.sender,_hashtag,_counterparty,_counterpartyThreshold,_dealID);
		IHashtag(_hashtag).registerDeal(deal,msg.sender);
		NewSimpleDeal(deal);
	}
}
