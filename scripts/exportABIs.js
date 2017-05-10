var Hashtag = artifacts.require("./Hashtag.sol");
var SimpleDealFactory = artifacts.require("./SimpleDealFactory.sol");
var SimpleDeal = artifacts.require("./SimpleDeal.sol");

module.exports = function(callback) {
  console.log('Hashtag');
  console.log(JSON.stringify({abi: Hashtag.toJSON().abi}));
  console.log('SimpleDeal');
  console.log(JSON.stringify({abi: SimpleDeal.toJSON().abi}));
  console.log('SimpleDealFactory');
  console.log(JSON.stringify({abi: SimpleDealFactory.toJSON().abi}));
};