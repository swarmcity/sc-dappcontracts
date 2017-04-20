pragma solidity ^0.4.8;

contract IHashtag {

  // inherited
  function owner() public constant returns(address);
  function transferOwnership(address newOwner);

  function name() public constant returns(string);
  function registeredDeals() public constant returns(uint);
  function successfulDeals() public constant returns(uint);
  function commission() public constant returns(uint);
  function getRepTokenAddress() returns(address);
  function getTokenAddress() returns(address);
  function getConflictResolver() returns(address);
  function registerDeal(address _dealContract,address _dealOwner);
  function mintRep(address _receiver,uint _amount);
}
