pragma solidity ^0.4.15;

contract IHashtag {

  // inherited
  function owner() public constant returns(address);
  function transferOwnership(address newOwner) public;

  function name() public constant returns(string);
  function validFactories() public constant returns(bool);
  function commission() public constant returns(uint);
  function metadataHash() public constant returns(string);
  function setMetadataHash(string _metadataHash);
  function setCommission(uint _newCommission);
  function addFactory(address _factoryAddress);
  function removeFactory(address _factoryAddress);
  function getProviderRepTokenAddress() returns(address);
  function getSeekerRepTokenAddress() returns(address);
  function getTokenAddress() returns(address);
  function getConflictResolver() returns(address);
  function mintProviderRep(address _receiver,uint _amount);
  function mintSeekerRep(address _receiver,uint _amount);
}
