var Hashtag = artifacts.require("./Hashtag.sol");
var DealForTwoFactory = artifacts.require("./DealForTwoFactory.sol");

module.exports = function(callback) {
  //FILL HASHTAG HERE
  var hashtagContract = "0x2e17d4c60a2fc3f1d586d2ca9d66b52f80a043c0";
  //var swtTokenFactory = "0x1ed1fbe0333a9e81746dff37df107c9cefe8d787";

  console.log('Deploying DealForTwoFactory. hashtag at ', hashtagContract);
  var self = this;

  this.web3.eth.getGasPrice(function(err, gasPrice) {

    console.log('gasprice = ', gasPrice.toNumber());

    DealForTwoFactory.new(hashtagContract,{
      gas: 2990380,
      gasPrice: gasPrice
    }).then(function(instance) {
      simpleDealFactory = instance;
      console.log('DealForTwoFactory created at address', simpleDealFactory.address);

    });
   
  });

};