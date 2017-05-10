var Hashtag = artifacts.require("./Hashtag.sol");
var SimpleDealFactory = artifacts.require("./SimpleDealFactory.sol");

module.exports = function(callback) {
  var swtTokencontract = "0xb9e7f8568e08d5659f5d29c4997173d84cdf2607";
  var swtTokenFactory = "0x1ed1fbe0333a9e81746dff37df107c9cefe8d787";

  console.log('Deploying Hashtag . SWT token at ', swtTokencontract);
  var self = this;

  this.web3.eth.getGasPrice(function(err, gasPrice) {

    console.log('gasprice = ', gasPrice.toNumber());

    // Hashtag.new(swtTokencontract, swtTokenFactory, "pioneer", 1, "QmXNNWiSKCpwH3241VDixSG189NmMWXPppiZLgDmfZ3Cih", {
    //   gas: 2990380,
    //   gasPrice: gasPrice
    // }).then(function(instance) {
    //   hashtagContract = instance;

    //   console.log("Hashtag deployed at", hashtagContract.address);

    //   self.web3.eth.getTransactionReceipt(instance.transactionHash, function(err, receipt) {
    //     console.log('gas used =', receipt.gasUsed);
    //     hashtagContract.getRepTokenAddress.call().then(function(reptokenaddress) {
    //       console.log('hashtag REP token created at address', reptokenaddress);
    //       callback();
    //     });
    var hashtagContract = Hashtag.at('0xbBf521A88B07D2B278DCeE18c006c545E32016a3');

    // SimpleDealFactory.new({
    //   gas: 2990380,
    //   gasPrice: gasPrice
    // }).then(function(instance) {
    //   simpleDealFactory = instance;
    //   console.log('SimpleDealFactory created at address', simpleDealFactory.address);

    //   self.web3.eth.getTransactionReceipt(instance.transactionHash, function(err, receipt) {
    //     console.log('gas used =', receipt.gasUsed);

        hashtagContract.addFactory('0x0fB83e531076C3b2272E186b11D15c5E46504b0f',{
          gas: 200000,
          gasPrice: gasPrice
        }).then(function(res) {

          self.web3.eth.getTransactionReceipt(res.tx, function(err, receipt) {
            console.log('simpleDealFactory whitelisted');
            console.log('gas used =', receipt.gasUsed);
            callback();
          });
        });
//      });
//    });
    // //SimpleDealFactory

  });


  //   }).catch(function(e) {
  //     console.log(e);
  //     callback();
  //   });
  // });
};