
// [KF] should we remove this from our repo?

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
	DealStatuses public dealStatus;
	uint public hashtagCommission;

	IHashtag hashtag;
	IMiniMeToken hashtagToken;
	// [KF] Add second rep token providerrep and requesterrep

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
        Resolved,
        Canceled
   	}

	function SimpleDeal(address _owner, address _hashtag, address _counterparty,uint _counterpartyThreshold, bytes32 _dealID){
		counterparty = _counterparty;
		counterpartyThreshold = _counterpartyThreshold;
		dealID = _dealID;
		dealStatus = DealStatuses.Open;
		hashtag = IHashtag(_hashtag);
		hashtagToken = IMiniMeToken(hashtag.getTokenAddress());
		// [KF] Add second rep token
		hashtagCommission = hashtag.commission();

		// now change ownership to the actual owner given by the factory.
		transferOwnership(_owner);
	}

	function cancel() onlyOwner {
		if (dealStatus != DealStatuses.Open && dealStatus != DealStatuses.OwnerFunded){
			throw;
		}
		if (!hashtagToken.transfer(owner,hashtagToken.balanceOf(this))){ throw; }
		dealStatus = DealStatuses.Canceled;
	}

	function fund(uint _value) onlyOwner {
		// only open deals can be funded.
		if (dealStatus != DealStatuses.Open){
			throw;
		}

		// you need enough funds to pay the commission of the hashtag.
		if (hashtagCommission > _value){
			throw;
		}

		//fund this contract - (this deal needs an allowance from owner)
		if (!hashtagToken.transferFrom(msg.sender,this,_value)){
			throw;
		}

		balances[msg.sender] = safeAdd(balances[msg.sender],_value);
		dealStatus = DealStatuses.OwnerFunded;

	}

	function claim(uint _value) {

		// only counterparty can fund , and must match the threshold and the deal must be funded by owner
		if (msg.sender != counterparty || _value < counterpartyThreshold || dealStatus != DealStatuses.OwnerFunded){
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

		// payout the commission to the hashtag owner
		if (!hashtagToken.transfer(hashtag.getConflictResolver(),hashtagCommission)){
			throw;
		}

		// send all remaining tokens to counterparty
		if (!hashtagToken.transfer(counterparty,hashtagToken.balanceOf(this))){
			throw;
		}

		// award some REP
		// [KF] Mint requesterrep for requester, mint providerrep for provider
		hashtag.mintRep(owner,1);
		hashtag.mintRep(counterparty,1);

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
	// commission is sent to the hashtag owner
	// the remaining value is sent to the counterparty
	function resolve(uint _amountOwner){
		if (msg.sender != hashtag.getConflictResolver()){
			throw;
		}
		// payout the commission to the hashtag owner
		if (!hashtagToken.transfer(hashtag.getConflictResolver(),hashtagCommission)){ throw; }
		// payout the allocation that the hashtag owner determined to the owner of this deal
		if (!hashtagToken.transfer(owner,_amountOwner)){ throw; }
		// payout the remainder to the counterparty of this deal
		if (!hashtagToken.transfer(counterparty,hashtagToken.balanceOf(this))){ throw; }
		dealStatus = DealStatuses.Resolved;
	}

}
