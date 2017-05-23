var Hashtag = artifacts.require("./Hashtag.sol");

module.exports = function(callback) {

  var self = this;

  this.web3.eth.getGasPrice(function(err, gasPrice) {

    console.log('gasprice = ', gasPrice.toNumber());

    var hashtagContract = Hashtag.at('0x5c21b622ac0a51d5b02060d2c483b26252939eee');

    hashtagContract.addFactory('0xab8243ded804e04f23fb3864fb2991c98dc0f59f', {
      gas: 200000,
      gasPrice: gasPrice
    }).then(function(res) {


    });


  });

};