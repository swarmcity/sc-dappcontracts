pragma solidity ^0.4.6;

/*
  MiniMeToken contract taken from https://github.com/Giveth/minime/
 */

// TokenController interface
contract TokenController {
    function proxyPayment(address _owner) payable returns(bool);
    function onTransfer(address _from, address _to, uint _amount) returns(bool);
    function onApprove(address _owner, address _spender, uint _amount) returns(bool);
}

// Minime interface
contract MiniMeToken {
    function generateTokens(address _owner, uint _amount
    ) returns (bool);
}



// Taken from Zeppelin's standard contracts.
contract ERC20 {
  uint public totalSupply;
  function balanceOf(address who) constant returns (uint);
  function allowance(address owner, address spender) constant returns (uint);

  function transfer(address to, uint value) returns (bool ok);
  function transferFrom(address from, address to, uint value) returns (bool ok);
  function approve(address spender, uint value) returns (bool ok);
  event Transfer(address indexed from, address indexed to, uint value);
  event Approval(address indexed owner, address indexed spender, uint value);
}

contract HashtagController is TokenController {

    MiniMeToken public tokenContract;   // The new token
    //ERC20 public arcToken;              // The ARC token address

    string public hashtagname;
    mapping (string => string) hashtagtranslations;

    function HashtagController(
        string _hashtagname,
        address _tokenAddress          // the new MiniMe token address
    ) {
        tokenContract = MiniMeToken(_tokenAddress); // The Deployed Token Contract
    }

/////////////////
// TokenController interface
/////////////////


    function proxyPayment(address _owner) payable returns(bool) {
        return false;
    }

    function onTransfer(address _from, address _to, uint _amount) returns(bool) {
        return false;
    }

    function onApprove(address _owner, address _spender, uint _amount) returns(bool)
    {
        return false;
    }

    function convert(uint _amount){

        // transfer ARC to the vault address. caller needs to have an allowance from
        // this controller contract for _amount before calling this or the transferFrom will fail.
//        if (!arcToken.transferFrom(msg.sender, 0x0, _amount)) {
//            throw;
//        }

        // mint new SWT tokens
//        if (!tokenContract.generateTokens(msg.sender, _amount)) {
//            throw;
//        }
    }


}