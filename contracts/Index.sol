pragma solidity ^0.4.8;

contract Index {	
  address[] public hashtags; //List of hashtags' addresses.
  string[] public names; //List of hashtags' names.
  address[] public factories; //List of hashtags' factories.

  function addMe(string name, address factory) {
    hashtags.push(msg.sender);
    names.push(name);
    factories.push(factory);
  }
}
