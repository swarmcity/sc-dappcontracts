pragma solidity ^0.4.8;

import 'zeppelin/ownership/Ownable.sol';

contract SimpleDeal is Ownable {
	bytes32 dealID;
	address counterparty;
	uint counterpartyThreshold;

	function SimpleDeal(address _counterparty,uint _counterpartyThreshold, bytes32 _dealID) payable{
		counterparty = _counterparty;
		counterpartyThreshold = _counterpartyThreshold;
		dealID = _dealID;
	}

	function claimDeal() payable {
		// only counterparty can fund , and must match the threshold
		if (msg.sender != counterparty || msg.value < counterpartyThreshold){
			throw;
		}

	}

}