var Hashtag = artifacts.require("./Hashtag.sol");
var SimpleDealFactory = artifacts.require("./SimpleDealFactory.sol");
var SimpleDeal = artifacts.require("./SimpleDeal.sol");
var DealForTwo = artifacts.require("./DealForTwo.sol");
var DealForTwoFactory = artifacts.require("./DealForTwoFactory.sol");

module.exports = function(callback) {
  console.log('Hashtag');
  console.log(JSON.stringify({abi: Hashtag.toJSON().abi}));
  console.log('DealForTwo');
  console.log(JSON.stringify({abi: DealForTwo.toJSON().abi}));
  console.log('DealForTwoFactory');
  console.log(JSON.stringify({abi: DealForTwoFactory.toJSON().abi}));
  console.log('SimpleDeal');
  console.log(JSON.stringify({abi: SimpleDeal.toJSON().abi}));
  console.log('SimpleDealFactory');
  console.log(JSON.stringify({abi: SimpleDealFactory.toJSON().abi}));
};