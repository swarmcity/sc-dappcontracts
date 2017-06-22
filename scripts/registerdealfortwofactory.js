var Hashtag = artifacts.require("./Hashtag.sol");

module.exports = function(callback) {

  var self = this;

  this.web3.eth.getGasPrice(function(err, gasPrice) {

    console.log('gasprice = ', gasPrice.toNumber());

    // HASHTAG GOES HERE
    var hashtagContract = Hashtag.at('0x2e17d4c60a2fc3f1d586d2ca9d66b52f80a043c0');

    // FACTORY GOES HERE
    hashtagContract.addFactory('0xaae46afad1dddb0666cd939e62fd58d81470ec4e', {
      gas: 200000,
      gasPrice: gasPrice
    }).then(function(res) {


    });


  });

};