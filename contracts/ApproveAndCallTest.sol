pragma solidity ^0.4.14;


contract ApproveAndCallTest {

	event ApproveCall(address from, uint256 _amount, address _token, bytes _data);
	event KustMnKloten(address wieda);

	function receiveApproval(address from, uint256 _amount, address _token, bytes _data){
		ApproveCall( from,  _amount,  _token,  _data);
		this.call(_data);
	}

	function kustmnkloten(address a){
		KustMnKloten(a);
	}
	
}
