pragma solidity ^0.4.11;

contract IPFSEvents {
	event HashAdded(address PubKey, string IPFSHash, uint ttl);
	event HashRemoved(address PubKey, string IPFSHash);
}