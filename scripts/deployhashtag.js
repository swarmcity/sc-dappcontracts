var Hashtag = artifacts.require("./Hashtag.sol");

module.exports = function(callback) {
  var swtTokencontract = "0xb9e7f8568e08d5659f5d29c4997173d84cdf2607";
  var swtTokenFactory = "0x1ed1fbe0333a9e81746dff37df107c9cefe8d787";

  console.log('Deploying Hashtag', swtTokencontract);
  var self = this;

  Hashtag.new(swtTokencontract, swtTokenFactory, "pioneer", 33, "QmXNNWiSKCpwH3241VDixSG189NmMWXPppiZLgDmfZ3Cih", {
    gas: 2990380
  }).then(function(instance) {
    hashtagContract = instance;
    //assert.isNotNull(hashtagContract);

    console.log("Hashtag deployed at", hashtagContract.address);

    self.web3.eth.getTransactionReceipt(instance.transactionHash, function(err, receipt) {
      console.log('gas used =', receipt.gasUsed);
      hashtagContract.getRepTokenAddress.call().then(function(reptokenaddress) {
        console.log('hashtag REP token created at address', reptokenaddress);
        callback();
      });
    });


  }).catch(function(e) {
    console.log(e);
    callback();
  });
};