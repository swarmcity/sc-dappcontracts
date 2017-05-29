var Hashtag = artifacts.require("./Hashtag.sol");
var DealForTwoFactory = artifacts.require("./DealForTwoFactory.sol");

module.exports = function(callback) {
  var hashtagContract = "0x5c21b622ac0a51d5b02060d2c483b26252939eee";
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