pragma solidity ^0.4.8;

contract IHashtag {

  // inherited
  function owner() public constant returns(address);
  function transferOwnership(address newOwner);

  function name() public constant returns(string);
  function registeredDeals() public constant returns(uint);
  function successfulDeals() public constant returns(uint);
  function validFactories() public constant returns(bool);
  function commission() public constant returns(uint);
  function metadataHash() public constant returns(string);
  function setMetadataHash(string _metadataHash);
  function addFactory(address _factoryAddress);
  function removeFactory(address _factoryAddress);
  function getRepTokenAddress() returns(address);
  function getTokenAddress() returns(address);
  function getConflictResolver() returns(address);
  function registerDeal(address _dealContract,address _dealOwner);
  function mintRep(address _receiver,uint _amount);
}
