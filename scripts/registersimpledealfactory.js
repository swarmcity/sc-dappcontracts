var Hashtag = artifacts.require("./Hashtag.sol");
var SimpleDealFactory = artifacts.require("./SimpleDealFactory.sol");

module.exports = function(callback) {
  var swtTokencontract = "0xb9e7f8568e08d5659f5d29c4997173d84cdf2607";
  var swtTokenFactory = "0x1ed1fbe0333a9e81746dff37df107c9cefe8d787";

  console.log('Deploying Hashtag . SWT token at ', swtTokencontract);
  var self = this;

  this.web3.eth.getGasPrice(function(err, gasPrice) {

    console.log('gasprice = ', gasPrice.toNumber());

    var hashtagContract = Hashtag.at('0xbBf521A88B07D2B278DCeE18c006c545E32016a3');

    hashtagContract.addFactory('0xab8243ded804e04f23fb3864fb2991c98dc0f59f', {
      gas: 200000,
      gasPrice: gasPrice
    }).then(function(res) {


    });


  });

};