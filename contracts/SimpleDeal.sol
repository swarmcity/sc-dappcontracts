pragma solidity ^0.4.8;

import '../installed_contracts/zeppelin/contracts/ownership/Ownable.sol';
import '../installed_contracts/zeppelin/contracts/SafeMath.sol';
import './IHashtag.sol';
import './IMiniMeToken.sol';

contract SimpleDeal is Ownable, SafeMath {
	bytes32 dealID;
	address counterparty;
	uint counterpartyThreshold;
	mapping(address=>uint) balances;
	DealStatuses dealStatus;
	uint hashtagCommission;

	IHashtag hashtag;
	IMiniMeToken hashtagToken;

	event Claimed();
	event Approved();
	event Disputed(bytes32 dealID);
	event Resolved(bytes32 dealID);

   	enum DealStatuses {
    	Open,
    	OwnerFunded,
        Ongoing,
        Approved,
        Disputed,
        Resolved
   	}

	function SimpleDeal(address _hashtag, address _counterparty,uint _counterpartyThreshold, bytes32 _dealID){
		counterparty = _counterparty;
		counterpartyThreshold = _counterpartyThreshold;
		dealID = _dealID;
		dealStatus = DealStatuses.Open;
		hashtag = IHashtag(_hashtag);
		hashtagToken = IMiniMeToken(hashtag.getTokenAddress());
		hashtagCommission = hashtag.commission();
		hashtag.registerDeal(this,msg.sender);
	}

	function cancel() onlyOwner {
		if (dealStatus != DealStatuses.Open){
			throw;
		}
		selfdestruct(owner);
	}

	function fund(uint _value) onlyOwner {
		// only open deals can be funded.
		if (dealStatus != DealStatuses.OwnerFunded){
			throw;
		}

		// you need enough funds to pay the commission of the hashtag.
		if (hashtagCommission > _value){
			throw;
		}

		// fund this contract - (this deal needs an allowance from owner)
		if (!hashtagToken.transferFrom(msg.sender,this,_value)){
			throw;
		}

		balances[msg.sender] = safeAdd(balances[msg.sender],_value);
		dealStatus = DealStatuses.OwnerFunded;

	}

	function claim(uint _value) {

		// only counterparty can fund , and must match the threshold and the deal must be funded by owner
		if (msg.sender != counterparty || _value < counterpartyThreshold || dealStatus != DealStatuses.Open){
			throw;
		}

		// fund this contract - needs an allowance
		if (!hashtagToken.transferFrom(msg.sender,this,_value)){
			throw;
		}

		dealStatus = DealStatuses.Ongoing;
		balances[msg.sender] = safeAdd(balances[msg.sender],_value);
		Claimed();
	}

	// owner approves the good execution and payment of this deal.
	function approve() onlyOwner {
		if (dealStatus != DealStatuses.Ongoing){
			throw;
		}

		// payout the hashtag owner
		if (!hashtagToken.transfer(hashtag.getConflictResolver(),hashtagCommission)){
			throw;
		}

		// send all remaining tokens to counterparty
		if (!hashtagToken.transfer(counterparty,hashtagToken.balanceOf(this))){
			throw;
		}
		Approved();
	}

	// owner or counterparty can put an Ongoing deal in a dispute state
	function dispute(){
		// only the owner or the counterparty can start a dispute
		if (msg.sender != owner && msg.sender != counterparty){
			throw;
		}
		// and only if the deal is ongoing
		if (dealStatus != DealStatuses.Ongoing){
			throw;
		}

		dealStatus = DealStatuses.Disputed;

	}

	// resolve this conflict by sending value to either parties
	// _amountOwner is sent to the owner
	// the remaining value is sent to the counterparty
	function resolve(uint _amountOwner){
		if (msg.sender != hashtag.getConflictResolver()){
			throw;
		}
		if (!hashtagToken.transfer(owner,_amountOwner)){ throw; }
		if (!hashtagToken.transfer(counterparty,hashtagToken.balanceOf(this))){ throw; }
		dealStatus = DealStatuses.Resolved;
	}

}