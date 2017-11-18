var Hashtag = artifacts.require("./Hashtag.sol");
var SimpleDealFactory = artifacts.require("./SimpleDealFactory.sol");

module.exports = function(callback) {
  var swtTokencontract = "0xb9e7f8568e08d5659f5d29c4997173d84cdf2607";
  var swtTokenFactory = "0x1ed1fbe0333a9e81746dff37df107c9cefe8d787";

  var self = this;

  this.web3.eth.getGasPrice(function(err, gasPrice) {

    console.log('gasprice = ', gasPrice.toNumber());

    Hashtag.new(swtTokencontract, swtTokenFactory, "Pioneer", 0.01 * 1e18, "QmXNNWiSKCpwH3241VDixSG189NmMWXPppiZLgDmfZ3Cih", {
      gas: 2990380,
      gasPrice: gasPrice
    }).then(function(instance) {
      hashtagContract = instance;

      console.log("Hashtag deployed at", hashtagContract.address);


    }).catch(function(e) {
      console.log(e);
      callback();
    });
  });
};