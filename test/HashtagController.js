var MiniMeTokenFactory = artifacts.require("./MiniMeToken.sol");
var MiniMeToken = artifacts.require("./MiniMeToken.sol");
var HashtagController = artifacts.require("./MiniMeToken.sol");

contract('HashtagController', function(accounts) {

  var deposit_address = accounts[1];

  //var hashtagToken; // this is the MiniMeToken version
  var miniMeTokenFactory;
  var arcToken; // this is the old ARC token contract
  var swtConverter; // this is the controller that converts ARC->SWT
  var clone0; // a clone token
  var clone1; // a clone token
  var self = this;

  describe('Deploy MiniMeToken TokenFactory', function() {
    it("should deploy MiniMeToken contract", function(done) {
      MiniMeTokenFactory.new().then(function(_miniMeTokenFactory) {
        assert.ok(_miniMeTokenFactory.address);
        miniMeTokenFactory = _miniMeTokenFactory;
        console.log('miniMeTokenFactory created at address', _miniMeTokenFactory.address);
        done();
      });
    });
  });

  describe('Deploy MiniMeToken Token & HashtagController', function() {

    var hashtagToken;

    it("should deploy MiniMeToken contract", function(done) {
      MiniMeToken.new(
        miniMeTokenFactory.address,
        0,
        0,
        "NeedaRideANT",
        18,
        "SWTREP",
        true
      ).then(function(_miniMeToken) {
        assert.ok(_miniMeToken.address);
        console.log('Hashtag token created at address', _miniMeToken.address);
        hashtagToken = _miniMeToken;
        done();
      });
    });

    it("should deploy Controller", function(done) {
      HashtagController.new(deposit_address, hashtagToken.address, arcToken.address).then(function(instance) {
        swtConverter = instance;
        assert.isNotNull(swtConverter);
        done();
      });
    });

    it("should set token's controller to HashtagController", function(done) {
      hashtagToken.changeController(swtConverter.address).then(function() {
        done();
      }).catch(function(e) {
        assert.fail(null, null, 'this function should not throw', e);
        done();
      });
    });
  });

  // describe('Convert ARC to SWT fails without having an allowance', function() {

  //   it("should not be able to convert without allowance", function(done) {
  //     swtConverter.convert(1).then(function() {
  //       assert.fail(null, null, 'This function should throw');
  //       done();
  //     }).catch(function() {
  //       done();
  //     });
  //   });
  // });

  // describe('Convert ARC to SWT with allowance', function() {

  //   it("should have correct balance on random token contract", function(done) {
  //     var balance = arcToken.balanceOf.call(accounts[0]).then(function(balance) {
  //       assert.equal(balance.valueOf(), 1000 * 1e18, "account not correct amount");
  //       done();
  //     });
  //   });

  //   it("should have zero balance on SWT token contract", function(done) {
  //     var balance = hashtagToken.balanceOf.call(accounts[0]).then(function(balance) {
  //       assert.equal(balance.valueOf(), 0, "account not correct amount");
  //       done();
  //     });
  //   });

  //   it("should give allowance to convert", function(done) {
  //     var balance = arcToken.balanceOf.call(accounts[0]).then(function(balance) {
  //       assert.equal(balance.valueOf(), 1000 * 1e18, "account not correct amount");
  //       arcToken.approve(swtConverter.address, balance).then(function() {
  //         done();
  //       });
  //     });
  //   });

  //   it("allowance should be visible in ARC token contract", function(done) {
  //     var balance = arcToken.allowance.call(accounts[0], swtConverter.address).then(function(allowanceamount) {
  //       assert.equal(allowanceamount.valueOf(), 1000 * 1e18, "allowanceamount not correct");
  //       done();
  //     });
  //   });

  //   it("should convert half of the ARC of this owner", function(done) {
  //     var balance = arcToken.balanceOf.call(accounts[0]).then(function(balance) {
  //       swtConverter.convert(balance.valueOf() / 2, {
  //         gas: 400000
  //       }).then(function() {
  //         done();
  //       }).catch(function(e) {
  //         assert.fail(null, null, 'This function should not throw', e);
  //         done();
  //       });
  //     });
  //   });

  //   it("should have the correct balance on SWT token contract", function(done) {
  //     var balance = hashtagToken.balanceOf.call(accounts[0]).then(function(balance) {
  //       assert.equal(balance.valueOf(), 1000 / 2 * 1e18, "account not correct amount");
  //       done();
  //     });
  //   });

  //   it("there should be an ARC balance on the deposit wallet", function(done) {
  //     var balance = arcToken.balanceOf.call(deposit_address).then(function(balance) {
  //       assert.equal(balance.valueOf(), 1000 / 2 * 1e18, "account not correct amount");
  //       done();
  //     });
  //   });

  //   it("should convert remaining balance of this owner", function(done) {
  //     var balance = arcToken.balanceOf.call(accounts[0]).then(function(balance) {
  //       swtConverter.convert(balance.valueOf(), {
  //         gas: 400000
  //       }).then(function() {
  //         done();
  //       }).catch(function(e) {
  //         assert.fail(null, null, 'This function should not throw', e);
  //         done();
  //       });
  //     });
  //   });

  //   it("should not be able to convert more tokens", function(done) {
  //     swtConverter.convert(1, {
  //       gas: 400000
  //     }).then(function() {
  //       assert.fail(null, null, 'This function should throw', e);
  //       done();
  //     }).catch(function(e) {
  //       done();
  //     });
  //   });

  //   it("should have new balance on SWT token contract", function(done) {
  //     var balance = hashtagToken.balanceOf.call(accounts[0]).then(function(balance) {
  //       assert.equal(balance.valueOf(), 1000 * 1e18, "account not correct amount");
  //       done();
  //     });
  //   });

  //   it("should have zero balance on ARC token contract", function(done) {
  //     var balance = arcToken.balanceOf.call(accounts[0]).then(function(balance) {
  //       assert.equal(balance.valueOf(), 0, "account not correct amount");
  //       done();
  //     });
  //   });

  //   it("there should be an ARC balance on the deposit wallet", function(done) {
  //     var balance = arcToken.balanceOf.call(deposit_address).then(function(balance) {
  //       assert.equal(balance.valueOf(), 1000 * 1e18, "account not correct amount");
  //       done();
  //     });
  //   });
  // });

  // describe('Cloning of contract at current block', function() {

  //   it("should be able to clone this contract at block " + self.web3.eth.blockNumber, function(done) {

  //     var watcher = hashtagToken.NewCloneToken();
  //     watcher.watch(function(error, result) {
  //       console.log('new clone contract at ', result.args._cloneToken);
  //       clone0 = MiniMeToken.at(self.web3.toHex(result.args._cloneToken));
  //       watcher.stopWatching();
  //       done();
  //     });

  //     hashtagToken.createCloneToken(
  //       "Swarm Voting Token",
  //       18,
  //       "SVT",
  //       Number.MAX_SAFE_INTEGER, // if the blocknumber > current block, minime defaults to the current block.
  //       true, {
  //         gas: 2000000
  //       }).then(function(txhash) {
  //       // the event watcher will call done()
  //     }).catch(function(e) {
  //       console.log('Error', e);
  //       assert.fail(null, null, 'This function should not throw', e);
  //       done();
  //     });
  //   });

  //   it("should be have the same balance as the original ", function(done) {
  //     var balance = clone0.balanceOf.call(accounts[0]).then(function(balance) {
  //       assert.equal(balance.valueOf(), 1000 * 1e18, "account not correct amount");
  //       done();
  //     });
  //   });
  // });


  // describe('Cloning of contract at block 0', function() {

  //   it("should be able to clone this contract at block 0", function(done) {
  //     var watcher = hashtagToken.NewCloneToken();
  //     watcher.watch(function(error, result) {
  //       console.log('new clone contract at ', result.args._cloneToken);
  //       clone1 = MiniMeToken.at(self.web3.toHex(result.args._cloneToken));
  //       watcher.stopWatching();
  //       done();
  //     });

  //     hashtagToken.createCloneToken(
  //       "Swarm Voting Token",
  //       18,
  //       "SVT",
  //       0,
  //       true, {
  //         gas: 2000000
  //       }).then(function(txhash) {
  //       // the event watcher will call done()
  //     }).catch(function(e) {
  //       console.log('Error', e);
  //       assert.fail(null, null, 'This function should not throw', e);
  //       done();
  //     });
  //   });

  //   it("should be have a zero SWT balance ", function(done) {
  //     var balance = clone1.balanceOf.call(accounts[0]).then(function(balance) {
  //       assert.equal(balance.valueOf(), 0, "account not correct amount");
  //       done();
  //     });
  //   });
  // });


});